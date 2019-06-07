use lambda_http::{lambda, IntoResponse, Request};
use lambda_runtime::{error::HandlerError, Context};
use serde_json::json;
use utils::{constraints, http_helper, maps};

use std::error::Error;
const DENSITY_SCALE: f64 = 5.0;

fn main() -> Result<(), Box<dyn Error>> {
    lambda!(density_wrapper);
    Ok(())
}
fn density_wrapper(event: Request, _ctx: Context) -> Result<impl IntoResponse, HandlerError> {
    match density(event) {
        Ok(res) => Ok(http_helper::build_response(200, &json!(res).to_string())),
        Err(e) => Ok(http_helper::build_response(
            400,
            &http_helper::construct_error(&e.to_string()),
        )),
    }
}
fn density(event: Request) -> Result<Vec<maps::GraphElement>, Box<dyn Error>> {
    let parameters: constraints::OptionParameters = serde_json::from_reader(event.body().as_ref())?;

    constraints::check_parameters(&parameters, &constraints::get_constraints())?;

    let constraints::OptionParameters {
        maturity,
        rate,
        num_u: num_u_base,
        cf_parameters,
        ..
    } = parameters; //destructure

    let num_u = (2 as usize).pow(num_u_base as u32);

    let results =
        maps::get_density_results_as_json(&cf_parameters, DENSITY_SCALE, num_u, maturity, rate)?;
    Ok(results)
}
