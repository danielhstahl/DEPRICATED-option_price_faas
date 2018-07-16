extern crate fang_oost_option;
extern crate fang_oost;
extern crate rayon;
extern crate black_scholes;
extern crate cf_functions;
extern crate num_complex;
#[macro_use]
extern crate serde_json;
#[macro_use]
extern crate serde_derive;

use serde_json::{to_value, Value, Error};
use fang_oost_option::option_pricing;
use std::env;
use std::collections::VecDeque;
use std::io;
use rayon::prelude::*;
use num_complex::Complex;


const put_price:i32=0;
const call_price:i32=1;

const put_delta:i32=2;
const call_delta:i32=3;

const put_gamma:i32=4;
const call_gamma:i32=5;

const put_theta:i32=6;
const call_theta:i32=7;

const density:i32=8;
const risk_measures:i32=9;

#[derive(Serialize, Deserialize)]
struct OptionParameters {
    T: f64,
    r:f64,
    S0:f64,
    lambda:f64,
    muJ:f64,
    sigJ:f64,
    sigma:f64,
    v0:f64,
    speed:f64,
    adaV:f64,
    rho:f64,
    k:VecDeque<f64>,
    quantile:f64,
    numU:usize
}

impl OptionParameters{
    fn extend_k(&mut self, x_max:f64){
        self.k.push_front((-x_max).exp()*self.S0);
        self.k.push_back(x_max.exp()*self.S0);
    }
}
#[derive(Serialize, Deserialize)]
struct GraphElementIV {
    atPoint:f64,
    value:f64,
    iv:f64
}
#[derive(Serialize, Deserialize)]
struct GraphElement {
    atPoint:f64,
    value:f64
}

fn get_jump_diffusion_vol(
    sigma:f64,
    lambda:f64,
    mu_j:f64,
    sig_j:f64,
    maturity:f64
)->f64 {
    ((sigma.powi(2)+lambda*(mu_j.powi(2)+sig_j.powi(2)))*maturity).sqrt()
}



fn print_density_and_greeks(
    x_values:&[f64],
    values:&[f64]
) { //void, prints to stdout
    let json_value=json!(
        x_values.iter().zip(values.iter()).map(|(x_val, val)|{
            GraphElement {
                atPoint:*x_val,
                value:*val
            }
        }).collect::<Vec<_>>()
    );
    println!("{}", json_value.to_string())
}

fn print_call_prices(
    strikes:&[f64],
    values:&[f64],
    asset:f64,
    rate:f64,
    maturity:f64
) { //void, prints to stdout
    let json_call_prices=json!(
        strikes.iter().zip(values.iter()).map(|(strike, price)|{
            let iv=black_scholes::call_iv(*price, asset, *strike, rate, maturity, 0.3);
            GraphElementIV {
                atPoint:*strike,
                value:*price,
                iv:iv
            }
        }).collect::<Vec<_>>()
    );
    println!("{}", json_call_prices.to_string())
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
    let option_range=fang_oost::get_density(
        num_u, &x_range, cf
    ).collect();
    print_density_and_greeks(&x_range, &option_range)
}


fn get_vol_from_parameters(
    parameters:&OptionParameters
)->f64{
    let OptionParameters {
        sigma, lambda, muJ, 
        sigJ, T, ..
    }=parameters;
    get_jump_diffusion_vol(
        *sigma, *lambda,
        *muJ, *sigJ, 
        *T
    )
}

fn main()-> Result<(), io::Error> {
    let args: Vec<String> = env::args().collect();
    println!("{}", args[1]);
    println!("{}", args[2]);
    let fn_choice:i32=args[1].parse().unwrap();
    let mut parameters:OptionParameters=serde_json::from_str(&args[2])?;

    let x_max_density=get_vol_from_parameters(&parameters)*5.0;
    let x_max_options=x_max_density*2.0;
    parameters.extend_k(x_max_options);
    
    let OptionParameters {
        T:maturity,
        r:rate,
        S0:asset,
        lambda,
        muJ:mu_j,
        sigJ:sig_j,
        sigma,
        v0,
        speed,
        adaV:ada_v,
        rho,
        k,
        quantile,
        numU:num_u_base
    }=parameters; //destructure
    let num_u=(2 as usize).pow(num_u_base as u32);
    let strikes=Vec::from(k);

    let inst_cf=cf_functions::merton_time_change_cf(
        maturity, rate, lambda, mu_j, sig_j, sigma, v0,
        speed, ada_v, rho
    );

    match fn_choice {
        call_price => print_call_prices(
                &strikes,
                &option_pricing::fang_oost_call_price(
                    num_u, asset, 
                    &strikes, rate, 
                    maturity, &inst_cf
                ),
                asset, rate, maturity
            ),
        put_price => print_density_and_greeks(
                &strikes,
                &option_pricing::fang_oost_put_price(
                    num_u, asset, 
                    &strikes, rate, 
                    maturity, &inst_cf
                )
            ),
        _ => println!("wow, nothing")
    }
    Ok(())
}
