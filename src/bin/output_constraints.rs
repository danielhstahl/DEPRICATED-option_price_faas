use lambda_http::{lambda, IntoResponse, Request, RequestExt};
use lambda_runtime::{error::HandlerError, Context};
use serde_json::json;
use std::error::Error;
use utils::{constraints, http_helper};
//use utils::;

fn main() -> Result<(), Box<dyn Error>> {
    lambda!(output_constraints_wrapper);
    Ok(())
}
fn output_constraints_wrapper(
    event: Request,
    _ctx: Context,
) -> Result<impl IntoResponse, HandlerError> {
    match output_constraints(event) {
        Ok(res) => Ok(http_helper::build_response(200, &res)),
        Err(e) => Ok(http_helper::build_response(
            400,
            &http_helper::construct_error(&e.to_string()),
        )),
    }
}

fn output_constraints(event: Request) -> Result<String, Box<dyn Error>> {
    let default_model = "";
    let path_parameters = event.path_parameters();
    let model = match path_parameters.get("model") {
        Some(m) => m,
        None => default_model,
    };
    let results = match model {
        "heston" => json!(constraints::get_heston_constraints()).to_string(),
        "cgmy" => json!(constraints::get_cgmy_constraints()).to_string(),
        "merton" => json!(constraints::get_merton_constraints()).to_string(),
        _ => json!(constraints::get_constraints()).to_string(),
    };
    Ok(results)
}
