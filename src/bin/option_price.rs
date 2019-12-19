#![deny(warnings)]
extern crate hyper;
extern crate pretty_env_logger;
use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Method, Request, Response, Server};
use serde_json::json;
use std::env;
use utils::{constraints, http_utils, maps};
const OPTION_SCALE: f64 = 10.0;
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
        async { Ok::<_, hyper::Error>(service_fn(coordinate_url)) }
    });
    let server = Server::bind(&addr).serve(make_svc);

    server.await?;

    Ok(())
}

async fn coordinate_url(req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
    let (_, _, path) = match http_utils::get_first_3_parameters(&req.uri()) {
        Some(v) => v,
        None => return http_utils::http_no_such_endpoint(),
    };
    match (req.method(), path) {
        (&Method::GET, "parameters") => output_constraints(req),
        (&Method::POST, "riskmetric") => risk_metric(req).await,
        (&Method::POST, "density") => density(req).await,
        (&Method::POST, "calculator") => price_options(req).await,
        _ => http_utils::http_no_such_endpoint(),
    }
}
fn output_constraints(req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
    let (_, model, _) = match http_utils::get_first_3_parameters(&req.uri()) {
        Some(v) => v,
        None => return http_utils::http_no_such_endpoint(),
    };
    let results = match model {
        "heston" => json!(constraints::get_heston_constraints()).to_string(),
        "cgmy" => json!(constraints::get_cgmy_constraints()).to_string(),
        "merton" => json!(constraints::get_merton_constraints()).to_string(),
        _ => json!(constraints::get_constraints()).to_string(),
    };
    Ok(Response::new(Body::from(results)))
}
async fn density(req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
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
        cf_parameters,
        ..
    } = parameters; //destructure

    let num_u = (2 as usize).pow(num_u_base as u32);

    let results = match maps::get_density_results_as_json(
        &cf_parameters,
        DENSITY_SCALE,
        num_u,
        maturity,
        rate,
    ) {
        Ok(v) => v,
        Err(e) => return http_utils::http_fail(e),
    };
    Ok(Response::new(Body::from(json!(results).to_string())))
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
async fn price_options(req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
    let iv_parameter = http_utils::get_query_param(&req.uri(), "includeImpliedVolatility");

    let include_iv = maps::get_iv_choice(&iv_parameter);
    let (option_type, sensitivity) = match http_utils::get_last_2_path_parameters(&req.uri()) {
        Some(v) => v,
        None => return http_utils::http_no_such_endpoint(), //should never get here
    };
    let fn_indicator = match maps::get_fn_indicators(option_type, sensitivity) {
        Ok(v) => v,
        Err(e) => return http_utils::http_fail(e),
    };

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
        asset,
        num_u: num_u_base,
        strikes,
        cf_parameters,
        ..
    } = parameters; //destructure

    let strikes_unwrap = match strikes.ok_or(constraints::throw_no_exist_error("strikes")) {
        Ok(v) => v,
        Err(e) => return http_utils::http_fail(e),
    };
    let asset_unwrap = match asset.ok_or(constraints::throw_no_exist_error("asset")) {
        Ok(v) => v,
        Err(e) => return http_utils::http_fail(e),
    };

    let num_u = (2 as usize).pow(num_u_base as u32);

    let results = match maps::get_option_results_as_json(
        fn_indicator,
        include_iv,
        &cf_parameters,
        OPTION_SCALE,
        num_u,
        asset_unwrap,
        maturity,
        rate,
        strikes_unwrap,
    ) {
        Ok(v) => v,
        Err(e) => return http_utils::http_fail(e),
    };
    Ok(Response::new(Body::from(json!(results).to_string())))
}
