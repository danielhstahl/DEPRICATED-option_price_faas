use lambda_http::{lambda, IntoResponse, Request};
use lambda_runtime::{error::HandlerError, Context};
use serde_json::json;
use std::error::Error;
use utils::{constraints, http_helper, maps};

const DENSITY_SCALE: f64 = 5.0;

fn main() -> Result<(), Box<dyn Error>> {
    lambda!(risk_metric_wrapper);
    Ok(())
}
fn risk_metric_wrapper(event: Request, _ctx: Context) -> Result<impl IntoResponse, HandlerError> {
    match risk_metric(event) {
        Ok(res) => Ok(http_helper::build_response(200, &json!(res).to_string())),
        Err(e) => Ok(http_helper::build_response(
            400,
            &http_helper::construct_error(&e.to_string()),
        )),
    }
}
fn risk_metric(event: Request) -> Result<cf_dist_utils::RiskMetric, Box<dyn Error>> {
    let parameters: constraints::OptionParameters = serde_json::from_reader(event.body().as_ref())?;

    constraints::check_parameters(&parameters, &constraints::get_constraints())?;

    let constraints::OptionParameters {
        maturity,
        rate,
        num_u: num_u_base,
        quantile,
        cf_parameters,
        ..
    } = parameters; //destructure

    let quantile_unwrap = quantile.ok_or(constraints::throw_no_exist_error("quantile"))?;

    let num_u = (2 as usize).pow(num_u_base as u32);

    let results = maps::get_risk_measure_results_as_json(
        &cf_parameters,
        DENSITY_SCALE,
        num_u,
        maturity,
        rate,
        quantile_unwrap,
    )?;
    Ok(results)
}
