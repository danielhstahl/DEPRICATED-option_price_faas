#[macro_use]
extern crate serde_json;
extern crate lambda_http;
extern crate lambda_runtime as runtime;
extern crate log;
extern crate simple_logger;
extern crate utils;
use lambda_http::{lambda, Body, Request, RequestExt, Response};
use runtime::{error::HandlerError, Context};

use std::error::Error;
use utils::constraints;

fn main() -> Result<(), Box<dyn Error>> {
    simple_logger::init_with_level(log::Level::Debug)?;
    lambda!(output_constraints);
    Ok(())
}

fn output_constraints(event: Request, ctx: Context) -> Result<Response<Body>, HandlerError> {
    let default_model = "";
    let path_parameters=event.path_parameters();
    let model = match path_parameters.get("model") {
        Some(m) => m,
        None => default_model
    };
    let results = match model {
        "heston" => json!(constraints::get_heston_constraints()).to_string(),
        "cgmy" => json!(constraints::get_cgmy_constraints()).to_string(),
        "merton" => json!(constraints::get_merton_constraints()).to_string(),
        _ => json!(constraints::get_constraints()).to_string(),
    };
    let res = Response::builder()
        .status(200)
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Credentials", "true")
        .body::<Body>(results.into())
        .map_err(|e| ctx.new_error(&e.to_string()))?;
    Ok(res)
}
