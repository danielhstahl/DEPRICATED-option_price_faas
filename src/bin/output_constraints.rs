#[macro_use]
extern crate serde_json;
extern crate lambda_http;
extern crate lambda_runtime as runtime;
extern crate log;
extern crate simple_logger;
extern crate utils;
use lambda_http::{lambda, Body, IntoResponse, Request, RequestExt, Response};
use runtime::{error::HandlerError, Context};

use std::error::Error;
use utils::constraints;

fn main() -> Result<(), Box<dyn Error>> {
    simple_logger::init_with_level(log::Level::Debug)?;
    lambda!(output_constraints_wrapper);
    Ok(())
}
fn output_constraints_wrapper(event: Request, ctx: Context) -> Result<impl IntoResponse, HandlerError> {
    match density(event, ctx){
        Ok(res)=>Ok(build_response(200, res)),
        Err(e)=>Ok(build_response(400, construct_error(e.to_string())))
    }
}

fn output_constraints(event: Request, ctx: Context) -> Result<& str, HandlerError> {
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
    }
}
