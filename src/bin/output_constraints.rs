#[macro_use]
extern crate serde_json;
extern crate utils;
extern crate log;
extern crate simple_logger;
extern crate lambda_runtime as lambda;
extern crate lambda_http;

use serde_derive::{Serialize, Deserialize};
use lambda::{lambda, Context, error::HandlerError};
use lambda_http::{lambda, Request, Response};

use log::error;
use std::error::Error;
use utils::constraints;
use utils::maps;

fn main() -> Result<(), Box<dyn Error>> {
    simple_logger::init_with_level(log::Level::Debug)?;
    lambda!(output_constraints);
    Ok(())
}

fn output_constraints(
    event:Request, 
    ctx:Context
)->Result<Response, HandlerError>{
    let default_model="".to_string();
    let model=maps::get_from_path(
        &event.path_parameters(),
        &default_model,
        "model"
    );
    let results=match model.as_str(){
        "heston"=>constraints::get_heston_constraints(),
        "cgmy"=>constraints::get_cgmy_constraints(),
        "merton"=>constraints::get_merton_constraints(),
        _=>constraints::get_constraints()
    };
    let res=Response::builder(200)
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Credentials", "true")
        .body(json!(results).to_string())?;
    Ok(res)
}