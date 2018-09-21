extern crate fang_oost_option;
extern crate cuckoo;
extern crate serde;
extern crate num_complex;
extern crate cf_functions;
extern crate constraints;
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

const STRIKE_RATIO:f64=10.0;
const NUM_U_FOR_CALIBRATION:usize=15; //seems reasonable in tests

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
    strikes_and_option_prices:&[option_calibration::OptionStats],
    asset:f64
)->(usize, f64, f64){
    let n=1024;
    let option_calibration::OptionStats{strike:strike_last, ..}=strikes_and_option_prices.last().expect("require at least one strike");
    let max_strike=strike_last*STRIKE_RATIO;
    /**
        reciprocal of max strike, but multiplied 
        by asset to ensure that the range stays 
        appropriate regardless of the asset size. 
        Note that this implies we have to "undo" 
        this later if we want symmetry
    */
    let min_strike=asset/max_strike;
    (n, min_strike, max_strike)
}

fn get_log_strike(
    x:f64,
    rate:f64,
    maturity:f64
)->f64{
    x-rate*maturity
}

fn get_raw_transformed_price(
    min_log_strike:f64,
    log_strike_increment:f64,
    index:usize
)->f64{
    min_log_strike+log_strike_increment*(index as f64)
}

fn get_log_strike_increment(
    min_log_strike:f64,
    max_log_strike:f64,
    n:usize
)->f64 {
    (max_log_strike-min_log_strike)/((n-1) as f64)
}
const LARGE_NUMBER:f64=500000.0;

#[derive(Serialize, Deserialize)]
struct CalibrationParameters{
    options:Vec<option_calibration::OptionStats>,
    asset:f64,
    constraints:collections::HashMap<String, cuckoo::UpperLower>
}
/*
fn get_filtered_parameter_iterator(
    constraint_map:&collections::HashMap<String, cuckoo::UpperLower>
)->impl Iterator<Item=&&str>
{
    POSSIBLE_CALIBRATION_PARAMETERS
        .iter()
        .filter(move |parameter_name|{
            constraint_map.contains_key(&parameter_name.to_string())
        })
}*/
/*
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
}*/
/*
fn get_array_or_field<'a, 'b: 'a>(
    calibration_parameters:&'b [f64],
    index_map:&'b collections::HashMap<String, usize>,
    static_parameters:&'b collections::HashMap<String, f64>
)->impl Fn(&str)->f64+'a {
    move |field| {
        if index_map.contains_key(field) { //then its calibrated, so return calibrated parameter
            let index:usize=*index_map.get(field).unwrap();
            calibration_parameters[index]
        }
        else { //not calibrated, return parameter supplied when executing the program
            *static_parameters.get(field).unwrap()
        }
    }
}*/
fn get_obj_fn<T>(
    phi_hat:Vec<(Complex<f64>, f64)>, //do we really want to borrow/move this??
    distinct_maturities:Vec<option_calibration::OptionStats>,
    cf_fn:T
)->impl Fn(&[f64])->f64
where T:Fn(&Complex<f64>, f64, &[f64])->Complex<f64>
{
    move |params|{
        distinct_maturities.iter().fold(0.0, |
                accumulate,
                option_calibration::OptionStats{maturity,..}
            |{
                accumulate+phi_hat.iter()
                    .fold(0.0, |accumulate, (phi, u)|{
                        let result=cf_fn(
                            &Complex::new(1.0, *u), 
                            *maturity, params
                        );
                        accumulate+if result.re.is_nan()||result.im.is_nan() {
                            LARGE_NUMBER
                        }
                        else {
                            (phi-result).norm_sqr()
                        }            
                    })
            }
        )/((phi_hat.len()*distinct_maturities.len()) as f64)        
    }
}


fn main()-> Result<(), io::Error> {
    let args: Vec<String> = env::args().collect();
    let fn_choice:i32=args[1].parse().unwrap();
    let fn_enhancement:i32=args[2].parse().unwrap();
    let p_constraints=constraints::get_constraints();
    let mut cp: CalibrationParameters = serde_json::from_str(&args[2])?;
    cp.options.sort_unstable_by(|option_calibration::OptionStats{maturity:a,..}, option_calibration::OptionStats{maturity:b,..}|a.partial_cmp(b));
    let num_nodes_in_spline=256;
    let u_array=get_u(NUM_U_FOR_CALIBRATION);
    let distinct_maturities=cp.options.copy()
        .dedup_by(
            |
                option_calibration::OptionStats{maturity:a,..},
                option_calibration::OptionStats{maturity:b,..}
            |a==b
        );
    let empirical_cf:Vec<(Complex<f64>, f64)>=distinct_maturities
        .iter()
        .flat_map(|option_calibration::OptionStats{maturity,rate, ..}|{
            let filtered_options=cp.options.iter().filter(
                |option_calibration::OptionStats{
                        maturity:option_maturity,
                        ..
                    }
                |maturity==option_maturity
            ).collect();
            let (n, min_strike, max_strike)=generate_const_parameters(
                &filtered_options, cp.asset
            );
            option_calibration::generate_fo_estimate(
                &filtered_options,
                &u_array,
                n,
                cp.asset, 
                rate,
                maturity,
                min_strike,
                max_strike
            ).zip(u_array)
        }).collect();
    match fn_choice {
        constraints::MERTON_LEVERAGE => {
            let ul=vec![
                p_constraints.lambda,
                p_constraints.mu_l,
                p_constraints.sig_l,
                p_constraints.sigma,
                p_constraints.v0,
                p_constraints.speed,
                p_constraints.eta_v,
                p_constraints.rho,
            ];
            let cf_fn=|u, t, params|{
                cf_functions::merton_time_change_log_cf(
                    u, t, 
                    params[0],
                    params[1],
                    params[2],
                    params[3],
                    params[4],
                    params[5],
                    params[6],
                    params[7]
                )
            };
            let fn_to_calibrate=get_obj_fn(
                empirical_cf,
                distinct_maturities,
                cf_fn
            );
            let nest_size=25;
            let total_mc=10000;
            let tol=0.000001;
            let (optim, fn_val)=cuckoo::optimize(
                &fn_to_calibrate, &ul, nest_size, 
                total_mc, tol, 
                ||cuckoo::get_rng_system_seed()
            );
            for p in optim.iter(){
                println!("p: {}", p);
            }
            println!("fn val: {}", fn_val);
            /*let optimal_param_map:collections::HashMap<
                String, f64
            >=index_map.into_iter().map(|(key, value)|{
                (key, optimal_parameters[value])
            }).collect();*/

            /*let json_results=json!({
                "optimal_parameters":optimal_param_map,
                "fn_result":fn_at_optimal_parameters
            });
            println!("{}", serde_json::to_string_pretty(&json_results).unwrap());*/
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