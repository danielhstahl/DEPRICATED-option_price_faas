#![deny(warnings)]
extern crate hyper;
extern crate pretty_env_logger;
use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Request, Response, Server};
use serde_json::json;
use std::env;
use utils::{constraints, http_utils, maps};

const DENSITY_SCALE: f64 = 5.0;

#[tokio::main]
pub async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    pretty_env_logger::init();
    let port_str = env::var("PORT")?;
    let port = port_str.parse::<u16>()?;
    let addr = ([0, 0, 0, 0], port).into();
    let make_svc = make_service_fn(|_conn| {
        // This is the `Service` that will handle the connection.
        // `service_fn` is a helper to convert a function that
        // returns a Response into a `Service`.
        async { Ok::<_, hyper::Error>(service_fn(risk_metric)) }
    });
    let server = Server::bind(&addr).serve(make_svc);

    server.await?;

    Ok(())
}

async fn risk_metric(req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
    let b = hyper::body::to_bytes(req).await?;
    let parameters: constraints::OptionParameters = match serde_json::from_reader(b.as_ref()) {
        Ok(v) => v,
        Err(e) => return http_utils::http_fail(e),
    };
    match constraints::check_parameters(&parameters, &constraints::get_constraints()) {
        Ok(_) => (),
        Err(e) => return http_utils::http_fail(e),
    };
    let constraints::OptionParameters {
        maturity,
        rate,
        num_u: num_u_base,
        quantile,
        cf_parameters,
        ..
    } = parameters; //destructure

    let quantile_unwrap = match quantile.ok_or(constraints::throw_no_exist_error("quantile")) {
        Ok(v) => v,
        Err(e) => return http_utils::http_fail(e),
    };

    let num_u = (2 as usize).pow(num_u_base as u32);

    let results = match maps::get_risk_measure_results_as_json(
        &cf_parameters,
        DENSITY_SCALE,
        num_u,
        maturity,
        rate,
        quantile_unwrap,
    ) {
        Ok(v) => v,
        Err(e) => return http_utils::http_fail(e),
    };
    Ok(Response::new(Body::from(json!(results).to_string())))
}
