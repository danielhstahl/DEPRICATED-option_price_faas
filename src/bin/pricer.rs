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
use lambda_http::{lambda, IntoResponse, Request, RequestExt};
use runtime::{error::HandlerError, Context};
use std::error::Error;
use std::io;
use utils::constraints;
use utils::maps;
use utils::http_helper;

const OPTION_SCALE: f64 = 10.0;

fn main() -> Result<(), Box<dyn Error>> {
    simple_logger::init_with_level(log::Level::Debug)?;
    lambda!(price_options_wrapper);
    Ok(())
}
fn price_options_wrapper(event: Request, _ctx: Context) -> Result<impl IntoResponse, HandlerError> {
    match price_options(event){
        Ok(res)=>Ok(http_helper::build_response(200, &json!(res).to_string())),
        Err(e)=>Ok(http_helper::build_response(
            400, 
            &http_helper::construct_error(&e.to_string())
        ))
    }
}
fn price_options(event: Request) -> Result<Vec<maps::GraphElement>, io::Error> {
    let parameters: constraints::OptionParameters =
        serde_json::from_reader(event.body().as_ref())?;

    constraints::check_parameters(&parameters, &constraints::get_constraints())?;

    let constraints::OptionParameters {
        maturity,
        rate,
        asset,
        num_u: num_u_base,
        strikes,
        cf_parameters,
        ..
    } = parameters; //destructure

    let strikes_unwrap = strikes
        .ok_or(constraints::throw_no_exist_error("strikes"))?;
    let asset_unwrap = asset
        .ok_or(constraints::throw_no_exist_error("asset"))?;

    let default_value = "";

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

    let model_indicator = maps::get_model_indicators(model)?;
    
    let fn_indicator = maps::get_fn_indicators(&option_type, &sensitivity)?;

    let query =match query_string_parameters.get("includeImpliedVolatility") {
        Some(m) => m,
        None => default_value,
    };

    let include_iv = maps::get_iv_choice(query);

    let num_u = (2 as usize).pow(num_u_base as u32);

    maps::get_option_results_as_json(
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
}
