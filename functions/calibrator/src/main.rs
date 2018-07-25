extern crate fang_oost_option;
extern crate cuckoo;
extern crate serde;
extern crate num_complex;
extern crate cf_functions;

use self::num_complex::Complex;
#[macro_use]
extern crate serde_json;
#[macro_use]
extern crate serde_derive;
use std::io;
use std::f64::consts::PI;
use fang_oost_option::option_calibration;
use std::env;
use std::collections;

#[derive(Serialize, Deserialize)]
struct CurvePoint{
    log_strike:f64,
    transformed_option:f64
}
#[derive(Serialize, Deserialize)]
struct CurvePoints{
    curve:Vec<CurvePoint>,
    points:Vec<CurvePoint>
}


fn get_u(
    n:usize
)->Vec<f64>{
    let du= 2.0*PI/(n as f64);
    (1..n).map(|index|index as f64*du).collect()
}

fn generate_const_parameters(
    strikes_and_option_prices:&[(f64, f64)],
    asset:f64
)->(usize, f64, f64){
    let n=1024;
    let (strike_last, _)=strikes_and_option_prices.last().expect("require at least one strike");
    let max_strike=strike_last*10.0;
    let min_strike=asset/max_strike; //recipricol of max strike, but multiplied by asset to ensure that the range stays appropriate regardless of the asset size. Note that this implies we have to "undo" this later if we want symmetry
    (n, min_strike, max_strike)
}

fn generate_spline_curves(
    strikes_and_option_prices:&[(f64, f64)],
    asset:f64,
    rate:f64,
    maturity:f64,
    num_nodes:usize
) { //void, prints to stdout
    let discount=(-rate*maturity).exp();
    let (_, min_strike, max_strike)=generate_const_parameters(
        strikes_and_option_prices, asset
    );
    let s=option_calibration::get_option_spline(
        strikes_and_option_prices,
        asset, discount, min_strike,
        max_strike
    ); //s is a spline that takes normalized strike (strike/asset)
    let min_log_strike=(min_strike).ln(); //no division by "asset" since  multiplied by "asset" size in "generate_const_parameters".  min_log_strike and max_log_strike are symmetric around 1.
    let max_log_strike=(max_strike/asset).ln();
    let dk_log=(max_log_strike-min_log_strike)/((num_nodes-1) as f64);
    let curves=json!(CurvePoints{
        curve:(0..num_nodes).map(|index|{
            let x=min_log_strike+dk_log*(index as f64);
            CurvePoint {
                log_strike:x-rate*maturity,
                transformed_option:option_calibration::max_zero_or_number(s(x.exp()))
            }
        }).collect(),
        points:strikes_and_option_prices.iter().map(|(strike, price)|{
            CurvePoint {
                log_strike:(strike/asset).ln()-rate*maturity,
                transformed_option:price/asset-option_calibration::max_zero_or_number(1.0-strike*discount/asset)
            }
        }).collect()
    });
    println!("{}", serde_json::to_string_pretty(&curves).unwrap());
}

fn generic_call_calibrator_cuckoo<T>(
    log_cf:T,
    ul:&[cuckoo::UpperLower],
    strikes_and_option_prices:&[(f64, f64)],
    asset:f64,
    rate:f64,
    maturity:f64
)->(Vec<f64>, f64)
    where T:Fn(&Complex<f64>, &[f64])->Complex<f64>
{
    let (n, min_strike, max_strike)=generate_const_parameters(
        strikes_and_option_prices, asset
    );
    let num_u=15;//seems reasonable in tests
    let u_array=get_u(num_u);
    //Note!  min_strike is NOT adjusted here.  There is nothing requiring symmetry around 1
    let estimate_of_phi=option_calibration::generate_fo_estimate(
        strikes_and_option_prices, asset, 
        rate, maturity, min_strike, max_strike
    );
    
    let phis=estimate_of_phi(n, &u_array);
    let obj_fn=option_calibration::get_obj_fn_arr(
        phis, u_array, log_cf
    );
    let nest_size=25;
    let total_mc=10000;
    let tol=0.000001;
    cuckoo::optimize(
        &obj_fn, &ul, nest_size, 
        total_mc, tol, 
        ||cuckoo::get_rng_system_seed()
    )
}

const SPLINE_CHOICE:i32=0;
const CALIBRATE_CHOICE:i32=1;
const POSSIBLE_CALIBRATION_PARAMETERS: &[&str] = &["lambda", "mu_l", "sig_l", "sigma", "v0", "speed", "eta_v", "rho"]; //order matters! same order as input into CF

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CalibrationParameters{
    strikes:Vec<f64>,
    prices:Vec<f64>,
    maturity:f64,
    rate:f64,
    asset:f64,
    constraints:collections::HashMap<String, cuckoo::UpperLower>,
    #[serde(flatten)]
    static_parameters: collections::HashMap<String, f64>
}

fn get_filtered_parameter_iterator(
    constraint_map:&collections::HashMap<String, cuckoo::UpperLower>
)->impl Iterator<Item=&&str>
{
    POSSIBLE_CALIBRATION_PARAMETERS
        .iter()
        .filter(move |parameter_name|{
            constraint_map.contains_key(&parameter_name.to_string())
        })
}

fn get_ul_and_index_of_array(
    constraint_map:&collections::HashMap<String, cuckoo::UpperLower>
)->(Vec<cuckoo::UpperLower>, collections::HashMap<String, usize>){

    let index_map:collections::HashMap<String, usize>=get_filtered_parameter_iterator(
            constraint_map
        )
        .enumerate()
        .map(|(index, parameter_name)|{
            (parameter_name.to_string(), index)
        }).collect();

    let ul=get_filtered_parameter_iterator(
            constraint_map
        ).map(|parameter_name|{
            constraint_map.get(&parameter_name.to_string()).unwrap()
        }).cloned().collect();
    (ul, index_map)
}

fn get_array_or_field<'a, 'b: 'a>(
    calibration_parameters:&'b [f64],
    index_map:&'b collections::HashMap<String, usize>,
    static_parameters:&'b collections::HashMap<String, f64>
)->impl Fn(&str)->f64+'a {
    move |field| {
        if index_map.contains_key(field) {
            let index:usize=*index_map.get(field).unwrap();
            calibration_parameters[index]
        }
        else {
            *static_parameters.get(field).unwrap()
        }
    }
}

fn main()-> Result<(), io::Error> {
    let args: Vec<String> = env::args().collect();
    let fn_choice:i32=args[1].parse().unwrap();
    let cp: CalibrationParameters = serde_json::from_str(&args[2])?;
    let strikes_prices:Vec<(f64, f64)>=cp.strikes.iter()
        .zip(cp.prices.iter())
        .map(|(strike, price)|(*strike, *price)).collect(); 
    match fn_choice {
        SPLINE_CHOICE => {
            generate_spline_curves(
                &strikes_prices,
                cp.asset, cp.rate, cp.maturity, 256
            )
        },
        CALIBRATE_CHOICE => {
            //slow, but only called once
            let (ul, index_map)=get_ul_and_index_of_array(&cp.constraints);
            let (
                optimal_parameters, 
                fn_at_optimal_parameters
            )={ //in brackets to show borrow of index_map
                let cf_hoc=|u:&Complex<f64>, calibration_parameters:&[f64]|{
                    let get_field=get_array_or_field(
                        calibration_parameters,
                        &index_map,
                        &cp.static_parameters
                    );
                    let maturity=cp.maturity;
                    let lambda=get_field(POSSIBLE_CALIBRATION_PARAMETERS[0]);
                    let mu_l=get_field(POSSIBLE_CALIBRATION_PARAMETERS[1]);
                    let sig_l=get_field(POSSIBLE_CALIBRATION_PARAMETERS[2]);
                    let sigma=get_field(POSSIBLE_CALIBRATION_PARAMETERS[3]);
                    let v0=get_field(POSSIBLE_CALIBRATION_PARAMETERS[4]);
                    let speed=get_field(POSSIBLE_CALIBRATION_PARAMETERS[5]);
                    let eta_v=get_field(POSSIBLE_CALIBRATION_PARAMETERS[6]);
                    let rho=get_field(POSSIBLE_CALIBRATION_PARAMETERS[7]);
                    cf_functions::merton_time_change_log_cf(
                        u, 
                        maturity, lambda, mu_l, sig_l, 
                        sigma, v0, speed, eta_v, rho 
                    )
                };
                generic_call_calibrator_cuckoo(
                    &cf_hoc,
                    &ul, 
                    &strikes_prices,
                    cp.asset,
                    cp.rate, 
                    cp.maturity
                )
            };
            let optimal_param_map:collections::HashMap<
                String, f64
            >=index_map.into_iter().map(|(key, value)|{
                (key, optimal_parameters[value])
            }).collect();

            let json_results=json!({
                "optimalParameters":optimal_param_map,
                "fnResult":fn_at_optimal_parameters
            });
            println!("{}", serde_json::to_string_pretty(&json_results).unwrap());
        },
        _ => println!("wow, nothing")

    }

    Ok(())
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_array_or_field() {
        let calibration_parameters=vec![1.0, 2.0, 3.0];
        let mut index_map=collections::HashMap::new();
        index_map.insert("value1".to_string(), 1 as usize);
        index_map.insert("value2".to_string(), 2 as usize);
        index_map.insert("value3".to_string(), 0 as usize);
        let mut extra=collections::HashMap::new();
        extra.insert("value4".to_string(), 4.0);
        let get_item=get_array_or_field(
            &calibration_parameters,
            &index_map,
            &extra
        );
        let mut actual=get_item("value2");
        assert_eq!(actual, 3.0);
        actual=get_item("value3");
        assert_eq!(actual, 1.0);
        actual=get_item("value1");
        assert_eq!(actual, 2.0);
        actual=get_item("value4");
        assert_eq!(actual, 4.0);
    }

    #[test]
    fn test_get_ul_and_index_of_array() {
        let mut constraint_map=collections::HashMap::new();
        constraint_map.insert(
            "sigma".to_string(), 
            cuckoo::UpperLower{lower:0.2, upper:0.4}
        );
        constraint_map.insert(
            "eta_v".to_string(), 
            cuckoo::UpperLower{lower:0.3, upper:0.5}
        );
        
        let (ul, index_map)=get_ul_and_index_of_array(&constraint_map);
        let sigma_ul=&ul[0];
        let ata_v_ul=&ul[1];
        assert_eq!(sigma_ul.lower, 0.2);
        assert_eq!(sigma_ul.upper, 0.4);
        assert_eq!(ata_v_ul.lower, 0.3);
        assert_eq!(ata_v_ul.upper, 0.5);
        let map_sigma=index_map.get(&"sigma".to_string()).unwrap();
        let map_eta_v=index_map.get(&"eta_v".to_string()).unwrap();
        assert_eq!(*map_sigma, 0 as usize);
        assert_eq!(*map_eta_v, 1 as usize);
    }

}