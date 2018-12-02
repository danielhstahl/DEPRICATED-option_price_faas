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
extern crate http; //I dont like that I need this

use http::Response as HttpResponse;
use lambda_http::{lambda, Body, Request, RequestExt, Response};
use runtime::{error::HandlerError, Context};

use std::error::Error;

use utils::constraints;
use utils::maps;

const DENSITY_SCALE: f64 = 5.0;

fn main() -> Result<(), Box<dyn Error>> {
    simple_logger::init_with_level(log::Level::Debug)?;
    lambda!(density);
    Ok(())
}

fn density(event: Request, ctx: Context) -> Result<Response, HandlerError> {
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

    let results = maps::get_density_results_as_json(
        model_indicator,
        &cf_parameters,
        DENSITY_SCALE,
        num_u,
        maturity,
        rate,
    )
    .map_err(|e| ctx.new_error(&e.to_string()))?;
    let res = HttpResponse::builder()
        .status(200)
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Credentials", "true")
        .body::<Body>(json!(results).to_string().into())
        .map_err(|e| ctx.new_error(&e.to_string()))?;
    Ok(res)
}
