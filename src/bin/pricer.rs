extern crate fang_oost_option;
extern crate fang_oost;
extern crate rayon;
extern crate black_scholes;
extern crate cf_functions;
extern crate num_complex;
extern crate cf_dist_utils;
extern crate serde_json;
extern crate serde_derive;
extern crate utils;

extern crate aws_lambda as lambda;

use utils::constraints;
use utils::maps;

const DENSITY_SCALE:f64=5.0;
const OPTION_SCALE_OVER_DENSITY:f64=2.0;
fn main() {
    lambda::gateway::start(|req| {
        let body=req.body().as_str()?;
        let parameters:constraints::OptionParameters=
            serde_json::from_str(body)?;

        constraints::check_parameters(
            &parameters, 
            &constraints::get_constraints()
        )?;

        let constraints::OptionParameters {
            maturity,
            rate,
            asset,
            quantile,
            num_u:num_u_base,
            strikes,
            cf_parameters,
            ..
        }=parameters; //destructure

        let path_parameters=req.extensions().get::<lambda::gateway::PathParameters>();
        let query_parameters=req.extensions().get::<lambda::gateway::QueryParameters>();
        let default_value="".to_string();
        let model=maps::get_from_path(
            &path_parameters,
            &default_value,
            "model"
        );

        let sensitivity=maps::get_from_path(
            &path_parameters,
            &default_value,
            "sensitivity"
        );
        let option_type=maps::get_from_path(
            &path_parameters,
            &default_value,
            "optionType"
        );

        let model_indicator=maps::get_model_indicators(&model)?;
        let fn_indicator=maps::get_fn_indicators(&option_type, &sensitivity)?;

        let query=maps::get_from_query(
            &query_parameters,
            &default_value,
            "includeImpliedVolatility"
        );

        let include_iv=maps::get_iv_choice(query);

        let num_u=(2 as usize).pow(num_u_base as u32);
        
        let result=maps::get_results_as_json(
            model_indicator,
            fn_indicator,
            include_iv,
            &cf_parameters,
            DENSITY_SCALE,
            OPTION_SCALE_OVER_DENSITY,
            num_u,
            asset,
            maturity,
            rate, 
            quantile,
            strikes
        )?;
        
        let res = lambda::gateway::response() // Create a response
            .status(200) // Set HTTP status code as 200 (Ok)
            .header("Access-Control-Allow-Origin", "*")
            .header("Access-Control-Allow-Credentials", "true")
            .body(lambda::gateway::Body::from(result))?; 
        Ok(res)
    })
}
