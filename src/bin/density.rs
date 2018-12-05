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

use utils::constraints;
use utils::maps;
use utils::http_helper;

const DENSITY_SCALE: f64 = 5.0;

fn main() -> Result<(), Box<dyn Error>> {
    simple_logger::init_with_level(log::Level::Debug)?;
    lambda!(density_wrapper);
    Ok(())
}
fn density_wrapper(event: Request, ctx: Context) -> Result<impl IntoResponse, HandlerError> {
    match density(event, ctx){
        Ok(res)=>Ok(http_helper::build_response(200, &json!(res).to_string())),
        Err(e)=>Ok(http_helper::build_response(
            400, 
            &http_helper::construct_error(&e.to_string())
        ))
    }
}
fn density(event: Request, ctx: Context) -> Result<Vec<maps::GraphElement>, HandlerError> {
    let parameters: constraints::OptionParameters =
        serde_json::from_reader(event.body().as_ref()).map_err(|e| ctx.new_error(&e.to_string()))?;

    constraints::check_parameters(&parameters, &constraints::get_constraints())
        .map_err(|e| ctx.new_error(&e.to_string()))?;

    let constraints::OptionParameters {
        maturity,
        rate,
        num_u: num_u_base,
        cf_parameters,
        ..
    } = parameters; //destructure

    let default_value = "";

    let path_parameters=event.path_parameters();

    let model = match path_parameters.get("model") {
        Some(m) => m,
        None => default_value
    };

    let model_indicator =
        maps::get_model_indicators(&model).map_err(|e| ctx.new_error(&e.to_string()))?;

    let num_u = (2 as usize).pow(num_u_base as u32);

    maps::get_density_results_as_json(
        model_indicator,
        &cf_parameters,
        DENSITY_SCALE,
        num_u,
        maturity,
        rate,
    )
    .map_err(|e| ctx.new_error(&e.to_string()))
}
