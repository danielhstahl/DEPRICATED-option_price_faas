#[macro_use]
extern crate serde_json;
extern crate utils;
extern crate aws_lambda as lambda;
use utils::constraints;
use utils::maps;

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