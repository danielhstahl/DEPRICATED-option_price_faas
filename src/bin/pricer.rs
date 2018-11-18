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

        let (fn_choice, cf_choice)=maps::get_fn_cf_indicators(
            req.uri().path()
        )?;

        let query=match req.uri().query(){
            Some(query)=>query,
            None=>""
        };

        let include_iv=maps::get_iv_choice(query);

        let num_u=(2 as usize).pow(num_u_base as u32);
        
        let result=maps::get_results_as_json(
            cf_choice,
            fn_choice,
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
            .body(lambda::gateway::Body::from(result))?; 
        Ok(res)
    })
}
