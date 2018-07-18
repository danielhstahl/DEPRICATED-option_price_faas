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
    logStrike:f64,
    transformedOption:f64
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
    let (strike_last, _)=strikes_and_option_prices.last().unwrap();
    let max_strike=strike_last*10.0;
    let min_strike=asset/max_strike;
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
    let (n, min_strike, max_strike)=generate_const_parameters(
        strikes_and_option_prices, asset
    );
    let s=option_calibration::get_option_spline(
        strikes_and_option_prices,
        asset, discount, min_strike,
        max_strike
    );
    let min_log_strike=min_strike.ln();
    let max_log_strike=(max_strike/asset).ln();
    let dk_log=(max_log_strike-min_log_strike)/((n-1) as f64);
    let curves=json!(CurvePoints{
        curve:(0..num_nodes).map(|index|{
            let x=min_log_strike+dk_log*(index as f64);
            CurvePoint {
                logStrike:x-rate*maturity,
                transformedOption:option_calibration::max_zero_or_number(s(x.exp()))
            }
        }).collect(),
        points:strikes_and_option_prices.iter().map(|(strike, price)|{
            CurvePoint {
                logStrike:(strike/asset).ln()-rate*maturity,
                transformedOption:price/asset-option_calibration::max_zero_or_number(1.0-strike*discount/asset)
            }
        }).collect()
    });
    println!("{}", curves.to_string());
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
    cuckoo::optimize(&obj_fn, &ul, nest_size, total_mc, tol, ||cuckoo::get_rng_system_seed())
}

const SPLINE_CHOICE:i32=0;
const CALIBRATE_CHOICE:i32=1;
const POSSIBLE_CALIBRATION_PARAMETERS: &[&str] = &["lambda", "muJ", "sigJ", "sigma", "v0", "speed", "adaV", "rho"]; //order matters! same order as input into CF

#[derive(Serialize, Deserialize)]
struct CalibrationParameters{
    k:Vec<f64>,
    prices:Vec<f64>,
    //variable:Vec<String>,
    T:f64,//1,
    r:f64,//0.05,
    S0:f64,//178.46,
    constraints:collections::HashMap<String, cuckoo::UpperLower>,
    #[serde(flatten)]
    //extra: collections::HashMap<String, serde_json::Value>
    extra: collections::HashMap<String, f64>

}
fn get_ul_and_index_of_array(
    constraint_map:&collections::HashMap<String, cuckoo::UpperLower>
)->(Vec<cuckoo::UpperLower>, collections::HashMap<String, usize>){
    let mut filtered_parameters=POSSIBLE_CALIBRATION_PARAMETERS
        .iter().enumerate()
        .filter(|(_, parameter_name)|{
            constraint_map.contains_key(&parameter_name.to_string())
        });

    let index_map:collections::HashMap<String, usize>=filtered_parameters.by_ref().map(|(index, parameter_name)|{
        (parameter_name.to_string(), index)
    }).collect();

    let ul=filtered_parameters.map(|(_, parameter_name)|{
        constraint_map.get(&parameter_name.to_string()).unwrap()
    }).cloned().collect();
    (ul, index_map)
}

fn get_array_or_field<'a, 'b: 'a>(
    calibration_parameters:&'b [f64],
    index_map:&'b collections::HashMap<String, usize>,
    extra:&'b collections::HashMap<String, f64>
)->impl Fn(&str)->f64+'a {
    move |field| {
        if index_map.contains_key(field) {
            let index:usize=*index_map.get(field).unwrap();
            calibration_parameters[index]
        }
        else {
            *extra.get(field).unwrap()
        }
    }
}

fn main()-> Result<(), io::Error> {
    let args: Vec<String> = env::args().collect();
    let fn_choice:i32=args[1].parse().unwrap();
    let cp: CalibrationParameters = serde_json::from_str(&args[2])?;
    let strikes_prices:Vec<(f64, f64)>=cp.k.iter()
        .zip(cp.prices.iter())
        .map(|(strike, price)|(*strike, *price)).collect(); 
    match fn_choice {
        SPLINE_CHOICE => {
            generate_spline_curves(
                &strikes_prices,
                cp.S0, cp.r, cp.T, 256
            )
        },
        CALIBRATE_CHOICE => {
            //slow, but only called once
            let (ul, index_map)=get_ul_and_index_of_array(&cp.constraints);
            
            let cf_hoc=|calibration_parameters:&[f64]|{
                let get_field=get_array_or_field(
                    calibration_parameters,
                    &index_map,
                    &cp.extra
                );
                let maturity=cp.T;
                let lambda=get_field(POSSIBLE_CALIBRATION_PARAMETERS[0]);
                let muJ=get_field(POSSIBLE_CALIBRATION_PARAMETERS[1]);
                let sigJ=get_field(POSSIBLE_CALIBRATION_PARAMETERS[2]);
                let sigma=get_field(POSSIBLE_CALIBRATION_PARAMETERS[3]);
                let v0=get_field(POSSIBLE_CALIBRATION_PARAMETERS[4]);
                let speed=get_field(POSSIBLE_CALIBRATION_PARAMETERS[5]);
                let adaV=get_field(POSSIBLE_CALIBRATION_PARAMETERS[6]);
                let rho=get_field(POSSIBLE_CALIBRATION_PARAMETERS[7]);
                move |u| cf_functions::merton_time_change_log_cf(
                    u, 
                    maturity, lambda, muJ, sigJ, 
                    sigma, v0, speed, adaV, rho 
                )
            };
        },
        _ => println!("wow, nothing")

    }

    Ok(())
}
