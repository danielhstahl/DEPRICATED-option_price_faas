extern crate fang_oost_option;
extern crate fang_oost;
extern crate rayon;
extern crate black_scholes;
extern crate cf_functions;
extern crate num_complex;
extern crate cf_dist_utils;
extern crate serde_json;
extern crate serde_derive;
extern crate utils;
extern crate log;
extern crate simple_logger;
extern crate lambda_runtime as lambda;
extern crate lambda_http;

use serde_derive::{Serialize, Deserialize};
use lambda::{lambda, Context, error::HandlerError};
use lambda_http::{lambda, Request, Response};
use std::error::Error;

use utils::constraints;
use utils::maps;

const OPTION_SCALE:f64=10.0;

fn main() -> Result<(), Box<dyn Error>> {
    simple_logger::init_with_level(log::Level::Debug)?;
    lambda!(price_options);
    Ok(())
}

fn price_options(
    event:Request, 
    ctx:Context
)->Result<Response, HandlerError>{

    let body=event.body.ok_or(ctx.new_error("Requires body"))?;

    let parameters:constraints::OptionParameters=serde_json::from_str(&body)    
        .map_err(|e|ctx.new_error(&e.to_string()))?;

    constraints::check_parameters(
        &parameters, 
        &constraints::get_constraints()
    ).map_err(|e|ctx.new_error(&e.to_string()))?;

    let constraints::OptionParameters {
        maturity,
        rate,
        asset,
        num_u:num_u_base,
        strikes,
        cf_parameters,
        ..
    }=parameters; //destructure

    let strikes_unwrap=strikes.ok_or(ctx.new_error("Requires strikes"))?;
    let asset_unwrap=asset.ok_or(ctx.new_error("Requires asset"))?;

    let default_value="".to_string();

    let model=maps::get_key_or_default(
        &event.path_parameters(),
        &default_value,
        "model"
    );

    let sensitivity=maps::get_key_or_default(
        &event.path_parameters(),
        &default_value,
        "sensitivity"
    );
    let option_type=maps::get_key_or_default(
        &event.path_parameters(),
        &default_value,
        "optionType"
    );

    let model_indicator=maps::get_model_indicators(&model)
        .map_err(|e|ctx.new_error(&e.to_string()))?;
    let fn_indicator=maps::get_fn_indicators(&option_type, &sensitivity)
        .map_err(|e|ctx.new_error(&e.to_string()))?;

    let query=maps::get_key_or_default(
        &event.query_string_parameters(),
        &default_value,
        "includeImpliedVolatility"
    );

    let include_iv=maps::get_iv_choice(query);

    let num_u=(2 as usize).pow(num_u_base as u32);
    
    let results=maps::get_option_results_as_json(
        model_indicator,
        fn_indicator,
        include_iv,
        &cf_parameters,
        OPTION_SCALE,
        num_u,
        asset_unwrap,
        maturity,
        rate, 
        strikes_unwrap
    ).map_err(|e|ctx.new_error(&e.to_string()))?;
    let res=Response::builder(200)
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Credentials", "true")
        .body(json!(results).to_string())?;
    Ok(res)
}
