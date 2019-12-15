#![deny(warnings)]
extern crate hyper;
extern crate pretty_env_logger;

use hyper::service::service_fn_ok;
use hyper::{Body, Request, Response, Server};
use serde_json::json;
use std::env;
use utils::{constraints, maps};

const OPTION_SCALE: f64 = 10.0;

/*fn main() -> Result<(), Box<dyn Error>> {
    lambda!(price_options_wrapper);
    Ok(())
}*/

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
        async { Ok::<_, Infallible>(service_fn(price_options)) }
    });
    let server = Server::bind(&addr).serve(make_svc);

    server.await?;

    Ok(())
}
/*
fn price_options_wrapper(event: Request, _ctx: Context) -> Result<impl IntoResponse, HandlerError> {
    match price_options(event) {
        Ok(res) => Ok(http_helper::build_response(200, &json!(res).to_string())),
        Err(e) => Ok(http_helper::build_response(
            400,
            &http_helper::construct_error(&e.to_string()),
        )),
    }
}*/
async fn price_options(body: Request<Body>) -> Result<Response<Body>, Infallible> {
    let parameters: constraints::OptionParameters = serde_json::from_reader(event.body().as_ref())?;

    constraints::check_parameters(&parameters, &constraints::get_constraints())?;

    let constraints::OptionParameters {
        maturity,
        rate,
        asset,
        num_u: num_u_base,
        strikes,
        cf_parameters,
        ..
    } = parameters; //destructure

    let strikes_unwrap = strikes.ok_or(constraints::throw_no_exist_error("strikes"))?;
    let asset_unwrap = asset.ok_or(constraints::throw_no_exist_error("asset"))?;

    let default_value = "";

    let path_parameters = event.path_parameters();
    let query_string_parameters = event.query_string_parameters();

    let sensitivity = match path_parameters.get("sensitivity") {
        Some(m) => m,
        None => default_value,
    };
    let option_type = match path_parameters.get("optionType") {
        Some(m) => m,
        None => default_value,
    };

    let fn_indicator = maps::get_fn_indicators(&option_type, &sensitivity)?;

    let query = match query_string_parameters.get("includeImpliedVolatility") {
        Some(m) => m,
        None => default_value,
    };

    let include_iv = maps::get_iv_choice(query);

    let num_u = (2 as usize).pow(num_u_base as u32);

    let results = maps::get_option_results_as_json(
        fn_indicator,
        include_iv,
        &cf_parameters,
        OPTION_SCALE,
        num_u,
        asset_unwrap,
        maturity,
        rate,
        strikes_unwrap,
    )?;
    Ok(Response::new(results))
}
