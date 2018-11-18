extern crate black_scholes;
extern crate cf_functions;
extern crate fang_oost;
extern crate rayon;
extern crate fang_oost_option;
extern crate num_complex;
extern crate cf_dist_utils;
extern crate serde;
use self::fang_oost_option::option_pricing;
use constraints;
use std::io;
use std::collections::HashMap;
use std::collections::VecDeque;
use std::io::{Error, ErrorKind};
use self::rayon::prelude::*;
use self::num_complex::Complex;

pub const CGMY:i32=0;
pub const MERTON:i32=1;
pub const HESTON:i32=2;

pub const PUT_PRICE:i32=0;
pub const CALL_PRICE:i32=1;

pub const PUT_DELTA:i32=2;
pub const CALL_DELTA:i32=3;

pub const PUT_GAMMA:i32=4;
pub const CALL_GAMMA:i32=5;

pub const PUT_THETA:i32=6;
pub const CALL_THETA:i32=7;

pub const DENSITY:i32=8;
pub const RISK_MEASURES:i32=9;

pub fn get_fn_cf_indicators(
    path:&str
)->Result<(i32, i32), io::Error>{
    match path {
        "/v1/cgmy/calculator/put/price"=>Ok((PUT_PRICE, CGMY)),
        "/v1/cgmy/calculator/call/price"=>Ok((CALL_PRICE, CGMY)),
        "/v1/cgmy/calculator/put/delta"=>Ok((PUT_DELTA, CGMY)),
        "/v1/cgmy/calculator/call/delta"=>Ok((CALL_DELTA, CGMY)),
        "/v1/cgmy/calculator/put/gamma"=>Ok((PUT_GAMMA, CGMY)),
        "/v1/cgmy/calculator/call/gamma"=>Ok((CALL_GAMMA, CGMY)),
        "/v1/cgmy/calculator/put/theta"=>Ok((PUT_THETA, CGMY)),
        "/v1/cgmy/calculator/call/theta"=>Ok((CALL_THETA, CGMY)),
        "/v1/cgmy/riskmetric"=>Ok((RISK_MEASURES, CGMY)),
        "/v1/cgmy/density"=>Ok((DENSITY, CGMY)),
        "/v1/merton/calculator/put/price"=>Ok((PUT_PRICE, MERTON)),
        "/v1/merton/calculator/call/price"=>Ok((CALL_PRICE, MERTON)),
        "/v1/merton/calculator/put/delta"=>Ok((PUT_DELTA, MERTON)),
        "/v1/merton/calculator/call/delta"=>Ok((CALL_DELTA, MERTON)),
        "/v1/merton/calculator/put/gamma"=>Ok((PUT_GAMMA, MERTON)),
        "/v1/merton/calculator/call/gamma"=>Ok((CALL_GAMMA, MERTON)),
        "/v1/merton/calculator/put/theta"=>Ok((PUT_THETA, MERTON)),
        "/v1/merton/calculator/call/theta"=>Ok((CALL_THETA, MERTON)),
        "/v1/merton/riskmetric"=>Ok((RISK_MEASURES, MERTON)),
        "/v1/merton/density"=>Ok((DENSITY, MERTON)),
        "/v1/heston/calculator/put/price"=>Ok((PUT_PRICE, HESTON)),
        "/v1/heston/calculator/call/price"=>Ok((CALL_PRICE, HESTON)),
        "/v1/heston/calculator/put/delta"=>Ok((PUT_DELTA, HESTON)),
        "/v1/heston/calculator/call/delta"=>Ok((CALL_DELTA, HESTON)),
        "/v1/heston/calculator/put/gamma"=>Ok((PUT_GAMMA, HESTON)),
        "/v1/heston/calculator/call/gamma"=>Ok((CALL_GAMMA, HESTON)),
        "/v1/heston/calculator/put/theta"=>Ok((PUT_THETA, HESTON)),
        "/v1/heston/calculator/call/theta"=>Ok((CALL_THETA, HESTON)),
        "/v1/heston/riskmetric"=>Ok((RISK_MEASURES, HESTON)),
        "/v1/heston/density"=>Ok((DENSITY, HESTON)),
        _ => Err(
            Error::new(ErrorKind::Other, format!("No matches for path {}!", path))
        )
    }
}
pub fn get_iv_choice(
    query:&str
)->bool{
    match query {
        "includeImpliedVolatility=true"=>true,
        _=>false
    }
}
pub fn get_results_as_json(
    cf_indicator:i32,
    fn_choice:i32,
    include_iv:bool,
    cf_parameters:&HashMap<String, f64>,
    density_scale:f64,
    option_scale_over_density:f64,
    num_u:usize,
    asset:f64,
    maturity:f64,
    rate:f64,
    quantile:f64,
    strikes:VecDeque<f64>
)->Result<
    String, 
    io::Error
> {
    match cf_indicator{
        CGMY=>{
            constraints::check_cf_parameters(
                &cf_parameters, 
                &constraints::get_cgmy_constraints()
            )?;
            let c=cf_parameters["c"]; //guaranteed to exist from the check
            let g=cf_parameters["g"];
            let m=cf_parameters["m"];
            let y=cf_parameters["y"];
            let sigma=cf_parameters["sigma"];
            let v0=cf_parameters["v0"];
            let speed=cf_parameters["speed"];
            let eta_v=cf_parameters["eta_v"];
            let rho=cf_parameters["rho"];
            let cf_inst=cf_functions::cgmy_time_change_cf(
                maturity, rate, c, g, m, y, sigma, v0,
                speed, eta_v, rho
            );
            let vol=cf_functions::cgmy_diffusion_vol(
                sigma, c, g, m, y, maturity
            );
            let x_max_density=vol*density_scale;
            let x_max_options=x_max_density*option_scale_over_density;
            get_results(
                fn_choice,
                include_iv,
                num_u,
                asset,
                rate,
                maturity,
                quantile,
                x_max_density,
                &constraints::extend_strikes(
                    strikes,
                    asset, 
                    x_max_options
                ),
                &cf_inst
            )
        },
        MERTON=>{
            constraints::check_cf_parameters(
                &cf_parameters, 
                &constraints::get_merton_constraints()
            )?;
            let lambda=cf_parameters["lambda"];
            let mu_l=cf_parameters["mu_l"];
            let sig_l=cf_parameters["sig_l"];
            let sigma=cf_parameters["sigma"];
            let v0=cf_parameters["v0"];
            let speed=cf_parameters["speed"];
            let eta_v=cf_parameters["eta_v"];
            let rho=cf_parameters["rho"];
            let cf_inst=cf_functions::merton_time_change_cf(
                maturity, rate, lambda, mu_l, sig_l, sigma, v0,
                speed, eta_v, rho
            );
            let vol=cf_functions::jump_diffusion_vol(
                sigma,
                lambda,
                mu_l,
                sig_l,
                maturity
            );
            let x_max_density=vol*density_scale;
            let x_max_options=x_max_density*option_scale_over_density;
            get_results(
                fn_choice,
                include_iv,
                num_u,
                asset,
                rate,
                maturity,
                quantile,
                x_max_density,
                &constraints::extend_strikes(
                    strikes,
                    asset, 
                    x_max_options
                ),
                &cf_inst
            )
        },
        HESTON=>{
            constraints::check_cf_parameters(
                &cf_parameters, 
                &constraints::get_heston_constraints()
            )?;
            let sigma=cf_parameters["sigma"];
            let v0=cf_parameters["v0"];
            let speed=cf_parameters["speed"];
            let eta_v=cf_parameters["eta_v"];
            let rho=cf_parameters["rho"];
            let cf_inst=cf_functions::heston_cf(
                maturity, rate, sigma, v0,
                speed, eta_v, rho
            );
            let x_max_density=sigma*density_scale;
            let x_max_options=x_max_density*option_scale_over_density;
            get_results(
                fn_choice,
                include_iv,
                num_u,
                asset,
                rate,
                maturity,
                quantile,
                x_max_density,
                &constraints::extend_strikes(
                    strikes,
                    asset, 
                    x_max_options
                ),
                &cf_inst
            )
        },
        _ => Err(
            Error::new(ErrorKind::Other, format!("No matches for cf indicator {}!", cf_indicator))
        )
    }
}



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

fn risk_measure_as_json(
    risk_measure:(f64, f64)
)->String {
    let (expected_shortfall, value_at_risk)=risk_measure;
    json!(RiskMeasures {
        value_at_risk,
        expected_shortfall
    }).to_string()
}

fn create_generic_iterator<'a, 'b:'a>(
    x_values:&'b [f64],
    values:&'b [f64]
)->impl Iterator<Item = (usize, (&'a f64, &'a f64))>+'a{
    let x_val_crit=values.len()-1;
    x_values.into_iter()
        .zip(values)
        .enumerate()
        .filter(move |(index, _)|index>&0&&index<&x_val_crit)
}

fn density_as_json(
    x_values:&[f64],
    values:&[f64]
)->String { 
    json!(
        x_values.iter().zip(values.iter()).map(|(x_val, val)|{
            GraphElement {
                at_point:*x_val,
                value:*val
            }
        }).collect::<Vec<_>>()
    ).to_string()
}

fn graph_no_iv_as_json(
    x_values:&[f64],
    values:&[f64]
)->String { 
    json!(create_generic_iterator(x_values, values)
        .map(|(_, (x_val, val))|{
            GraphElement {
                at_point:*x_val,
                value:*val
            }
        }).collect::<Vec<_>>()
    ).to_string()
}
fn graph_iv_as_json(
    x_values:&[f64],
    values:&[f64],
    iv_fn:&Fn(f64, f64)->f64
)->String { 
    json!(create_generic_iterator(x_values, values)
        .map(|(_, (strike, price))|{
            let iv=iv_fn(*price, *strike);
            GraphElementIV {
                at_point:*strike,
                value:*price,
                iv
            }
        }).collect::<Vec<_>>()
    ).to_string()
}

fn call_iv_as_json(
    x_values:&[f64],
    values:&[f64],
    asset:f64,
    rate:f64,
    maturity:f64
)->String {
    graph_iv_as_json(x_values, values, &|price, strike|{
        black_scholes::call_iv(
            price, asset, strike, 
            rate, maturity
        )
    })
}
fn put_iv_as_json(
    x_values:&[f64],
    values:&[f64],
    asset:f64,
    rate:f64,
    maturity:f64
)->String {
    graph_iv_as_json(x_values, values, &|price, strike|{
        black_scholes::put_iv(
            price, asset, strike, 
            rate, maturity
        )
    })
}

fn adjust_density<T>(
    num_u:usize,
    x_max:f64,
    cf:T    
)->String 
    where T:Fn(&Complex<f64>)->Complex<f64>+
    std::marker::Sync+std::marker::Send
{
    let num_x=128;
    let x_min=-x_max;
    let x_domain=fang_oost::get_x_domain(
        num_x, x_min, x_max
    ).collect::<Vec<_>>();
    let discrete_cf=fang_oost::get_discrete_cf(
        num_u, x_min, x_max, &cf
    );
    let option_range:Vec<f64>=fang_oost::get_density(
        x_min, x_max, 
        fang_oost::get_x_domain(
            num_x, x_min, x_max
        ), 
        &discrete_cf
    ).collect();
    density_as_json(&x_domain, &option_range)
}
const MAX_SIMS:usize=100;
const PRECISION:f64=0.0000001;
fn get_results(
    fn_choice:i32,
    include_iv:bool,
    num_u:usize,
    asset:f64,
    rate:f64,
    maturity:f64,
    quantile:f64,
    x_max_density:f64,
    strikes:&[f64],
    inst_cf:&(Fn(&Complex<f64>)->Complex<f64>+std::marker::Sync)
)->Result<String, io::Error>{
    match fn_choice {
        CALL_PRICE => {
            let prices=option_pricing::fang_oost_call_price(
                num_u, asset, &strikes,
                rate, maturity, &inst_cf
            );
            if include_iv {
                Ok(call_iv_as_json(
                    &strikes, 
                    &prices, 
                    asset, 
                    rate,
                    maturity
                ))
            } else {
                Ok(graph_no_iv_as_json(
                    &strikes, 
                    &prices
                ))
            }
        },
        PUT_PRICE => {
            let prices=option_pricing::fang_oost_put_price(
                num_u, asset, &strikes,
                rate, maturity, &inst_cf
            );
            if include_iv {
                Ok(put_iv_as_json(
                    &strikes,
                    &prices,
                    asset, rate, maturity
                ))
            } else {
                Ok(graph_no_iv_as_json(
                    &strikes,
                    &prices
                ))
            }
        },
        CALL_DELTA => {
            Ok(graph_no_iv_as_json(
                &strikes,
                &option_pricing::fang_oost_call_delta(
                    num_u, asset, 
                    &strikes, rate, 
                    maturity, &inst_cf
                )
            ))
        },
        PUT_DELTA => {
            Ok(graph_no_iv_as_json(
                &strikes,
                &option_pricing::fang_oost_put_delta(
                    num_u, asset, 
                    &strikes, rate, 
                    maturity, &inst_cf
                )
            ))
        },
        CALL_GAMMA => {
            Ok(graph_no_iv_as_json(
                &strikes,
                &option_pricing::fang_oost_call_gamma(
                    num_u, asset, 
                    &strikes, rate, 
                    maturity, &inst_cf
                )
            ))
        },
        PUT_GAMMA => {
            Ok(graph_no_iv_as_json(
                &strikes,
                &option_pricing::fang_oost_put_gamma(
                    num_u, asset, 
                    &strikes, rate, 
                    maturity, &inst_cf
                )
            ))
        },
        CALL_THETA => {
            Ok(graph_no_iv_as_json(
                &strikes,
                &option_pricing::fang_oost_call_theta(
                    num_u, asset, 
                    &strikes, rate, 
                    maturity, &inst_cf
                )
            ))
        },
        PUT_THETA => {
            Ok(graph_no_iv_as_json(
                &strikes,
                &option_pricing::fang_oost_put_theta(
                    num_u, asset, 
                    &strikes, rate, 
                    maturity, &inst_cf
                )
            ))
        },
        DENSITY => {
            Ok(adjust_density(
                num_u, x_max_density, &inst_cf
            ))
        },
        RISK_MEASURES => {
            Ok(risk_measure_as_json(
                cf_dist_utils::get_expected_shortfall_and_value_at_risk(
                    quantile, num_u, -x_max_density, 
                    x_max_density, MAX_SIMS, PRECISION, &inst_cf
                )
            ))
        },
        _ => Err(
            Error::new(ErrorKind::Other, format!("No matches for function indicator {}!", fn_choice))
        )
    }
}

