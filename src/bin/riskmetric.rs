#![deny(warnings)]
extern crate hyper;
extern crate pretty_env_logger;

use hyper::service::service_fn_ok;
use hyper::{Body, Request, Response, Server};
use serde_json::json;
use std::env;
use utils::{constraints, maps};

const DENSITY_SCALE: f64 = 5.0;

#[tokio::main]
pub async fn main() {
    pretty_env_logger::init();
    let port = match env::var("PORT") {
        Ok(p) => p.parse::<u16>(),
        Err(e) => Err(e),
    }
    .map_err(|e| eprintln!("port error: {}", e));
    let addr = ([0, 0, 0, 0], port).into();
    let make_svc = make_service_fn(|_conn| {
        // This is the `Service` that will handle the connection.
        // `service_fn` is a helper to convert a function that
        // returns a Response into a `Service`.
        async { Ok::<_, Infallible>(service_fn(risk_metric)) }
    });
    let server = Server::bind(&addr).serve(make_svc);

    server.await?;

    Ok(())
}
/*
fn risk_metric_wrapper(event: Request, _ctx: Context) -> Result<impl IntoResponse, HandlerError> {
    match risk_metric(event) {
        Ok(res) => Ok(http_helper::build_response(200, &json!(res).to_string())),
        Err(e) => Ok(http_helper::build_response(
            400,
            &http_helper::construct_error(&e.to_string()),
        )),
    }
}*/
async fn risk_metric(body: Request<Body>) -> Result<Response<Body>, Infallible> {
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
    Ok(Response::new(results))
}
