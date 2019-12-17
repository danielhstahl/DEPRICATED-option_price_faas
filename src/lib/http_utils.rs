use hyper::{Body, Response, StatusCode};
use std::collections::HashMap;
use std::error::Error;
use url::form_urlencoded;

pub fn http_fail<T: Error>(e: T) -> Result<Response<Body>, hyper::Error> {
    Ok(Response::builder()
        .status(StatusCode::BAD_REQUEST)
        .body(e.to_string().into())
        .unwrap())
}

//this would be inefficient except that I only ever get a single key
pub fn get_query_param(uri: &hyper::Uri, key: &str) -> String {
    let default_value = String::from("");
    let query_parameters = uri.query().unwrap_or("");
    let params = form_urlencoded::parse(query_parameters.as_ref())
        .into_owned()
        .collect::<HashMap<String, String>>();
    params.get(key).unwrap_or(&default_value).to_string()
}

pub fn get_last_2_path_parameters(uri: &hyper::Uri) -> Option<(&str, &str)> {
    let last_2: Vec<&str> = uri.path().rsplit("/").take(2).collect();
    let last = last_2.get(0)?;
    let second_to_last = last_2.get(1)?;
    Some((second_to_last, last)) //reverse order
}
pub fn get_first_3_parameters(uri: &hyper::Uri) -> Option<(&str, &str, &str)> {
    let first_3: Vec<&str> = uri.path().split("/").take(3).collect();
    let first = first_3.get(0)?;
    let second = first_3.get(1)?;
    let third = first_3.get(2)?;
    Some((first, second, third))
}

pub fn http_no_such_endpoint() -> Result<Response<Body>, hyper::Error> {
    Ok(Response::builder()
        .status(StatusCode::NOT_FOUND)
        .body("No such endpoint".into())
        .unwrap())
}

#[cfg(test)]
mod tests {
    use crate::http_utils::*;
    use hyper::Request;
    #[test]
    fn get_query_param_returns_empty_string_if_no_query() {
        let req = Request::builder()
            .method("GET")
            .uri("https://www.rust-lang.org/")
            .body(())
            .unwrap();
        let query_param = get_query_param(&req.uri(), "anthing");
        assert_eq!(query_param, "");
    }
    #[test]
    fn get_query_param_returns_value() {
        let req = Request::builder()
            .method("GET")
            .uri("https://www.rust-lang.org/hello?five=4")
            .body(())
            .unwrap();
        let query_param = get_query_param(&req.uri(), "five");
        assert_eq!(query_param, "4");
    }
    #[test]
    fn get_last_2_path_parameters_works_with_two_slashes() {
        let req = Request::builder()
            .method("GET")
            .uri("https://www.rust-lang.org/hello/world")
            .body(())
            .unwrap();
        let (first, second) = get_last_2_path_parameters(&req.uri()).unwrap();
        assert_eq!(first, "hello");
        assert_eq!(second, "world");
    }
    #[test]
    fn get_last_2_path_parameters_works_with_three_slashes() {
        let req = Request::builder()
            .method("GET")
            .uri("https://www.rust-lang.org/hello/world/again")
            .body(())
            .unwrap();
        let (first, second) = get_last_2_path_parameters(&req.uri()).unwrap();
        assert_eq!(first, "world");
        assert_eq!(second, "again");
    }
    #[test]
    fn get_none_with_one_slashes() {
        let req = Request::builder()
            .method("GET")
            .uri("/world")
            .body(())
            .unwrap();
        assert_eq!(get_last_2_path_parameters(&req.uri()), None);
    }
    #[test]
    fn get_first_3_path_parameters_works_with_slashes() {
        let req = Request::builder()
            .method("GET")
            .uri("https://www.rust-lang.org/hello/world")
            .body(())
            .unwrap();
        let (first, second, third) = get_first_3_parameters(&req.uri()).unwrap();
        assert_eq!(first, "www.rust-lang.org");
        assert_eq!(second, "hello");
        assert_eq!(third, "world");
    }
    #[test]
    fn get_first_3_get_none_with_one_slashes() {
        let req = Request::builder()
            .method("GET")
            .uri("/world")
            .body(())
            .unwrap();
        assert_eq!(get_first_3_parameters(&req.uri()), None);
    }
}
