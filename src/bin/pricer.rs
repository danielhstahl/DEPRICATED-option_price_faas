#![deny(warnings)]
extern crate hyper;
extern crate pretty_env_logger;
use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Request, Response, Server};
use serde_json::json;
use std::env;
use utils::{constraints, http_utils, maps};
const OPTION_SCALE: f64 = 10.0;

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
        async { Ok::<_, hyper::Error>(service_fn(price_options)) }
    });
    let server = Server::bind(&addr).serve(make_svc);

    server.await?;

    Ok(())
}

async fn price_options(req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
    let iv_parameter = http_utils::get_query_param(&req.uri(), "imcludeImpliedVolatility");

    let include_iv = maps::get_iv_choice(&iv_parameter);
    let (option_type, sensitivity) = http_utils::get_last_2_path_parameters(&req.uri());
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
