use std::error::Error;
use std::io;
use self::lambda_http::{IntoResponse, Response};

pub fn build_response(code:usize, body:&str) -> Result<impl IntoResponse,  Box<dyn Error>> {
    Response::builder()
        .status(code)
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Credentials", "true")
        .body(body.into())
}

pub fn construct_error(e_message:& str)->& str{
    json!({
        "err":e_message
    }).to_string()
}