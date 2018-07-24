extern crate fang_oost_option;
extern crate fang_oost;
extern crate rayon;
extern crate black_scholes;
extern crate cf_functions;
extern crate num_complex;
extern crate cf_dist_utils;
#[macro_use]
extern crate serde_json;
#[macro_use]
extern crate serde_derive;

extern crate constraints;

use fang_oost_option::option_pricing;
use std::env;
use std::io;
use rayon::prelude::*;
use num_complex::Complex;


const PUT_PRICE:i32=0;
const CALL_PRICE:i32=1;

const PUT_DELTA:i32=2;
const CALL_DELTA:i32=3;

const PUT_GAMMA:i32=4;
const CALL_GAMMA:i32=5;

const PUT_THETA:i32=6;
const CALL_THETA:i32=7;

const DENSITY:i32=8;
const RISK_MEASURES:i32=9;




#[derive(Serialize, Deserialize)]
struct GraphElementIV {
    at_point:f64,
    value:f64,
    iv:f64
}
#[derive(Serialize, Deserialize)]
struct GraphElement {
    at_point:f64,
    value:f64
}
#[derive(Serialize, Deserialize)]
struct RiskMeasures {
    value_at_risk:f64,
    expected_shortfall:f64
}

fn get_jump_diffusion_vol(
    sigma:f64,
    lambda:f64,
    mu_l:f64,
    sig_l:f64,
    maturity:f64
)->f64 {
    ((sigma.powi(2)+lambda*(mu_l.powi(2)+sig_l.powi(2)))*maturity).sqrt()
}

fn print_risk_measures(
    risk_measure:(f64, f64)
) {
    let (expected_shortfall, value_at_risk)=risk_measure;
    let json_value=json!(
        RiskMeasures {
            value_at_risk,
            expected_shortfall
        }
    );
    println!("{}", serde_json::to_string_pretty(&json_value).unwrap())
}

fn print_density(
    x_values:&[f64],
    values:&[f64]
) { //void, prints to stdout
    let json_value=json!(
        x_values.iter().zip(values.iter()).map(|(x_val, val)|{
            GraphElement {
                at_point:*x_val,
                value:*val
            }
        }).collect::<Vec<_>>()
    );
    println!("{}", serde_json::to_string_pretty(&json_value).unwrap())
}
fn print_greeks(
    x_values:&[f64],
    values:&[f64]
) { //void, prints to stdout
    let x_val_crit=x_values.len()-1;
    let json_value=json!(
        x_values.iter().zip(values.iter())
            .enumerate().filter(|(index, _)|index>&0&&index<&x_val_crit)
            .map(|(_, (x_val, val))|{
                GraphElement {
                    at_point:*x_val,
                    value:*val
                }
            }).collect::<Vec<_>>()
    );
    println!("{}", serde_json::to_string_pretty(&json_value).unwrap())
}

fn print_call_prices(
    strikes:&[f64],
    values:&[f64],
    asset:f64,
    rate:f64,
    maturity:f64
) { //void, prints to stdout
    let x_val_crit=values.len()-1;
    let json_call_prices=json!(
        strikes.iter().zip(values.iter())
            .enumerate().filter(|(index, _)|index>&0&&index<&x_val_crit)
            .map(|(_, (strike, price))|{
                let iv=black_scholes::call_iv(*price, asset, *strike, rate, maturity, 0.3);
                GraphElementIV {
                    at_point:*strike,
                    value:*price,
                    iv
                }
            }).collect::<Vec<_>>()
    );
    println!("{}", serde_json::to_string_pretty(&json_call_prices).unwrap())
}

fn adjust_density<T>(
    num_u:usize,
    x_max:f64,
    cf:T    
) 
    where T:Fn(&Complex<f64>)->Complex<f64>+
    std::marker::Sync+std::marker::Send
{
    let num_x=128;
    let x_range=fang_oost::compute_x_range(
        num_x, -x_max, x_max
    );
    let option_range:Vec<f64>=fang_oost::get_density(
        num_u, &x_range, cf
    ).collect();
    print_density(&x_range, &option_range)
}


fn get_vol_from_parameters(
    parameters:&constraints::OptionParameters
)->f64{
    let constraints::OptionParameters {
        sigma, lambda, mu_l, 
        sig_l, maturity, ..
    }=parameters;
    get_jump_diffusion_vol(
        *sigma, *lambda,
        *mu_l, *sig_l, 
        *maturity
    )
}

fn main()-> Result<(), io::Error> {
    let args: Vec<String> = env::args().collect();
    let fn_choice:i32=args[1].parse().unwrap();
    let mut parameters:constraints::OptionParameters=serde_json::from_str(&args[2])?;
    constraints::check_constraints(
        &parameters, 
        &constraints::get_constraints()
    )?;
    let x_max_density=get_vol_from_parameters(&parameters)*5.0;
    let x_max_options=x_max_density*2.0;
    parameters.extend_k(x_max_options);
    
    let constraints::OptionParameters {
        maturity,
        rate,
        asset,
        lambda,
        mu_l,
        sig_l,
        sigma,
        v0,
        speed,
        eta_v,
        rho,
        strikes,
        quantile,
        num_u:num_u_base
    }=parameters; //destructure
    
    let num_u=(2 as usize).pow(num_u_base as u32);
    let strikes=Vec::from(strikes);
    //note...if pass by reference doesn't work 
    //I can always move this value since I only
    //use it once.  However, if I ever want 
    //this binary to stay "live" for multiple
    //calls I'll need to keep this reference around
    let inst_cf=cf_functions::merton_time_change_cf(
        maturity, rate, lambda, mu_l, sig_l, sigma, v0,
        speed, eta_v, rho
    );

    match fn_choice {
        CALL_PRICE => print_call_prices(
                &strikes,
                &option_pricing::fang_oost_call_price(
                    num_u, asset, 
                    &strikes, rate, 
                    maturity, &inst_cf
                ),
                asset, rate, maturity
            ),
        PUT_PRICE => print_greeks(
                &strikes,
                &option_pricing::fang_oost_put_price(
                    num_u, asset, 
                    &strikes, rate, 
                    maturity, &inst_cf
                )
            ),
        CALL_DELTA => print_greeks(
                &strikes,
                &option_pricing::fang_oost_call_delta(
                    num_u, asset, 
                    &strikes, rate, 
                    maturity, &inst_cf
                )
            ),
        PUT_DELTA => print_greeks(
                &strikes,
                &option_pricing::fang_oost_put_delta(
                    num_u, asset, 
                    &strikes, rate, 
                    maturity, &inst_cf
                )
            ),
        CALL_GAMMA => print_greeks(
                &strikes,
                &option_pricing::fang_oost_call_gamma(
                    num_u, asset, 
                    &strikes, rate, 
                    maturity, &inst_cf
                )
            ),
        PUT_GAMMA => print_greeks(
                &strikes,
                &option_pricing::fang_oost_put_gamma(
                    num_u, asset, 
                    &strikes, rate, 
                    maturity, &inst_cf
                )
            ),
        CALL_THETA => print_greeks(
                &strikes,
                &option_pricing::fang_oost_call_theta(
                    num_u, asset, 
                    &strikes, rate, 
                    maturity, &inst_cf
                )
            ),
        PUT_THETA => print_greeks(
                &strikes,
                &option_pricing::fang_oost_put_theta(
                    num_u, asset, 
                    &strikes, rate, 
                    maturity, &inst_cf
                )
            ),
        DENSITY => adjust_density(
                num_u, x_max_density, &inst_cf
            ),
        RISK_MEASURES => print_risk_measures(
                cf_dist_utils::get_expected_shortfall_and_value_at_risk(
                    quantile, num_u, -x_max_density, x_max_density, &inst_cf
                )
            ),
        _ => println!("wow, nothing")
    }
    Ok(())
}
