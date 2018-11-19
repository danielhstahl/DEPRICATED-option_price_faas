#[macro_use]
extern crate serde_json;
extern crate utils;
extern crate aws_lambda as lambda;
use utils::constraints;

fn main() {
    lambda::gateway::start(|req| {
        let results=match req.uri().path(){
            "/realoptions/v1/heston/parameters/parameter_ranges"=>json!(
                constraints::get_heston_constraints()
            ).to_string(),
            "/realoptions/v1/cgmy/parameters/parameter_ranges"=>json!(
                constraints::get_cgmy_constraints()
            ).to_string(),
            "/realoptions/v1/merton/parameters/parameter_ranges"=>json!(
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