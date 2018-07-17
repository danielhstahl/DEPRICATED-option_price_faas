extern crate fang_oost_option;
extern crate cuckoo;
extern crate serde;
#[macro_use]
extern crate serde_json;
#[macro_use]
extern crate serde_derive;
use std::io;
use std::f64::consts::PI;
use fang_oost_option::option_calibration;
use std::env;

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
)->(Vec<f64>, f64){
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
    cuckoo::optimize()
}


#[derive(Serialize, Deserialize)]
struct CalibrationParameters{
    k:Vec<f64>,
    prices:Vec<f64>,
    T:f64,//1,
    r:f64,//0.05,
    S0:f64//178.46
}
fn main()-> Result<(), io::Error> {
    let args: Vec<String> = env::args().collect();
    let fn_choice:i32=args[1].parse().unwrap();
    let cp: CalibrationParameters = serde_json::from_str(&args[2])?;
    let strikes_prices:Vec<(f64, f64)>=cp.k.iter()
        .zip(cp.prices.iter())
        .map(|(strike, price)|(*strike, *price)).collect();
    generate_spline_curves(
        &strikes_prices,
        cp.S0, cp.r, cp.T, 256
    );

    Ok(())
}
