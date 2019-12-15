#![deny(warnings)]
extern crate hyper;
extern crate pretty_env_logger;

use hyper::service::service_fn_ok;
use hyper::{Body, Request, Response, Server};
use serde_json::json;
use std::env;
use utils::{constraints, maps};

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
        async { Ok::<_, Infallible>(service_fn(output_constraints)) }
    });
    let server = Server::bind(&addr).serve(make_svc);

    server.await?;

    Ok(())
}
/*
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
*/
async fn output_constraints(body: Request<Body>) -> Result<Response<Body>, Infallible> {
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
