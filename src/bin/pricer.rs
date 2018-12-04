extern crate black_scholes;
extern crate cf_dist_utils;
extern crate cf_functions;
extern crate fang_oost;
extern crate fang_oost_option;
extern crate lambda_http;
extern crate lambda_runtime as runtime;
extern crate log;
extern crate num_complex;
extern crate rayon;
extern crate serde_derive;
#[macro_use]
extern crate serde_json;
extern crate simple_logger;
extern crate utils;
use lambda_http::{lambda, Body, Request, RequestExt, Response};
use runtime::{error::HandlerError, Context};
use std::error::Error;

use utils::constraints;
use utils::maps;

const OPTION_SCALE: f64 = 10.0;

fn main() -> Result<(), Box<dyn Error>> {
    simple_logger::init_with_level(log::Level::Debug)?;
    lambda!(price_options);
    Ok(())
}

fn price_options(event: Request, ctx: Context) -> Result<Response<Body>, HandlerError> {
    let parameters: constraints::OptionParameters =
        serde_json::from_reader(event.body().as_ref()).map_err(|e| ctx.new_error(&e.to_string()))?;

    constraints::check_parameters(&parameters, &constraints::get_constraints())
        .map_err(|e| ctx.new_error(&e.to_string()))?;

    let constraints::OptionParameters {
        maturity,
        rate,
        asset,
        num_u: num_u_base,
        strikes,
        cf_parameters,
        ..
    } = parameters; //destructure

    let strikes_unwrap = strikes.ok_or(ctx.new_error("Requires strikes"))?;
    let asset_unwrap = asset.ok_or(ctx.new_error("Requires asset"))?;

    let default_value = "";//.to_string();

    let path_parameters=event.path_parameters();
    let query_string_parameters=event.query_string_parameters();
    
    let model = match path_parameters.get("model") {
        Some(m) => m,
        None => default_value
    };

    let sensitivity = match path_parameters.get("sensitivity") {
        Some(m) => m,
        None => default_value,
    };
    let option_type =match path_parameters.get("optionType") {
        Some(m) => m,
        None => default_value,
    };

    let model_indicator =
        maps::get_model_indicators(model).map_err(|e| ctx.new_error(&e.to_string()))?;
    
    let fn_indicator = maps::get_fn_indicators(&option_type, &sensitivity)
        .map_err(|e| ctx.new_error(&e.to_string()))?;

    let query =match query_string_parameters.get("includeImpliedVolatility") {
        Some(m) => m,
        None => default_value,
    };

    let include_iv = maps::get_iv_choice(query);

    let num_u = (2 as usize).pow(num_u_base as u32);

    let results = maps::get_option_results_as_json(
        model_indicator,
        fn_indicator,
        include_iv,
        &cf_parameters,
        OPTION_SCALE,
        num_u,
        asset_unwrap,
        maturity,
        rate,
        strikes_unwrap,
    )
    .map_err(|e| ctx.new_error(&e.to_string()))?;
    let res = Response::builder()
        .status(200)
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Credentials", "true")
        .body::<Body>(json!(results).to_string().into())
        .map_err(|e| ctx.new_error(&e.to_string()))?;
    Ok(res)
}
