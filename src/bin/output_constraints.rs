#[macro_use]
extern crate serde_json;
extern crate utils;
extern crate aws_lambda;
extern crate lambda_runtime as lambda;

use aws_lambda::aws_lambda_events;

use serde_derive::{Serialize, Deserialize};
use lambda::{lambda, Context, error::HandlerError};
use log::error;
use std::error::Error;
use utils::constraints;
use utils::maps;

fn main() -> Result<(), Box<dyn Error>> {
    simple_logger::init_with_level(log::Level::Debug)?;
    lambda!(output_constraints);
}

fn output_constraints(
    event:aws_lambda_events::encodings::ApiGatewayProxyRequest, 
    ctx:Context
)->Result<Vec<GraphElement>, HandlerError>{


}
fn main() {
    lambda::gateway::start(|req| {
        let path_parameters=req.extensions().get::<lambda::gateway::PathParameters>();
        let default_model="".to_string();
        let model=maps::get_from_path(
            &path_parameters,
            &default_model,
            "model"
        );

        let results=match model.as_str(){
            "heston"=>json!(
                constraints::get_heston_constraints()
            ).to_string(),
            "cgmy"=>json!(
                constraints::get_cgmy_constraints()
            ).to_string(),
            "merton"=>json!(
                constraints::get_merton_constraints()
            ).to_string(),
            _=>json!(
                constraints::get_constraints()
            ).to_string()
        };
        let res = lambda::gateway::response() // Create a response
        .status(200) // Set HTTP status code as 200 (Ok)
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Credentials", "true")
        .body(lambda::gateway::Body::from(results))?; 
        Ok(res)
    })
}