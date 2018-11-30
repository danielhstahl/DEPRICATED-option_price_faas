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
extern crate aws_lambda_events;
extern crate log;
extern crate simple_logger;
extern crate lambda_runtime as lambda;

use aws_lambda_events::event::apigw;

use serde_derive::{Serialize, Deserialize};
use lambda::{lambda, Context, error::HandlerError};
use std::error::Error;

use utils::constraints;
use utils::maps;

const DENSITY_SCALE:f64=5.0;

fn main() -> Result<(), Box<dyn Error>> {
    simple_logger::init_with_level(log::Level::Debug)?;
    lambda!(risk_metric);
    Ok(())
}

fn risk_metric(
    event:apigw::ApiGatewayProxyRequest, 
    ctx:Context
)->Result<maps::RiskMeasures, HandlerError>{
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
        num_u:num_u_base,
        quantile,
        cf_parameters,
        ..
    }=parameters; //destructure

    let quantile_unwrap=quantile.ok_or(ctx.new_error("Requires quantile"))?;

    let default_value="".to_string();
    let model=maps::get_key_or_default(
        &event.path_parameters,
        &default_value,
        "model"
    );

    let model_indicator=maps::get_model_indicators(&model)
        .map_err(|e|ctx.new_error(&e.to_string()))?;

    let num_u=(2 as usize).pow(num_u_base as u32);
    
    maps::get_risk_measure_results_as_json(
        model_indicator,
        &cf_parameters,
        DENSITY_SCALE,
        num_u,
        maturity,
        rate,
        quantile_unwrap
    ).map_err(|e|ctx.new_error(&e.to_string()))
}
