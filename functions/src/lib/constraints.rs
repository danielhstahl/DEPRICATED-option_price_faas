extern crate cuckoo;
extern crate serde_json;
#[macro_use]
extern crate serde_derive;

use std::collections::VecDeque;
use std::collections::HashMap;
use std::io;
use std::io::{Error, ErrorKind};

pub const CGMY:i32=0;
pub const MERTON:i32=1;
pub const HESTON:i32=2;

#[derive(Serialize, Deserialize)]
pub struct OptionParameters {
    pub maturity: f64,
    pub rate:f64,
    pub asset:f64,
    pub strikes:VecDeque<f64>,
    pub quantile:f64,
    pub num_u:usize, //raised to the power of two.  if this is 8, then there will be 2^8=256 discrete "u"
    pub cf_parameters:HashMap<String, f64>
}

pub fn extend_strikes(
    mut strikes:VecDeque<f64>,
    asset:f64,
    x_max:f64
)->Vec<f64>{
    strikes.push_back((-x_max).exp()*asset);
    strikes.push_front(x_max.exp()*asset);
    Vec::from(strikes)
}
/*
#[derive(Serialize, Deserialize)]
pub struct MertonParameters{
    pub lambda:f64,
    pub mu_l:f64,
    pub sig_l:f64,
    pub sigma:f64,
    pub v0:f64,
    pub speed:f64,
    pub eta_v:f64,
    pub rho:f64
}
#[derive(Serialize, Deserialize)]
pub struct CgmyParameters{
    pub c:f64,
    pub g:f64,
    pub m:f64,
    pub y:f64,
    pub sigma:f64,
    pub v0:f64,
    pub speed:f64,
    pub eta_v:f64,
    pub rho:f64
}
#[derive(Serialize, Deserialize)]
pub struct HestonParameters{
    pub sigma:f64,
    pub v0:f64, //v0 is on variance, not time change
    pub speed:f64,
    pub eta_v:f64,
    pub rho:f64
}*/
/*
impl OptionParameters{
    pub fn extend_strikes(&mut self, x_max:f64){
        self.strikes.push_back((-x_max).exp()*self.asset);
        self.strikes.push_front(x_max.exp()*self.asset);
    }
}
*/

#[derive(Serialize, Deserialize)] 
pub struct ParameterConstraints{
    pub rate:cuckoo::UpperLower,
    pub asset:cuckoo::UpperLower,
    pub maturity:cuckoo::UpperLower,
    pub num_u:cuckoo::UpperLower,
    pub quantile:cuckoo::UpperLower
}
/*
#[derive(Serialize, Deserialize)] 
pub struct MertonConstraints{
    pub lambda:cuckoo::UpperLower,
    pub mu_l:cuckoo::UpperLower,
    pub sig_l:cuckoo::UpperLower,
    pub sigma:cuckoo::UpperLower,
    pub v0:cuckoo::UpperLower,
    pub speed:cuckoo::UpperLower,
    pub eta_v:cuckoo::UpperLower,
    pub rho:cuckoo::UpperLower
}
#[derive(Serialize, Deserialize)] 
pub struct CgmyConstraints{
    pub c:cuckoo::UpperLower,
    pub g:cuckoo::UpperLower,
    pub m:cuckoo::UpperLower,
    pub y:cuckoo::UpperLower,
    pub sigma:cuckoo::UpperLower,
    pub v0:cuckoo::UpperLower,
    pub speed:cuckoo::UpperLower,
    pub eta_v:cuckoo::UpperLower,
    pub rho:cuckoo::UpperLower
}
#[derive(Serialize, Deserialize)] 
pub struct HestonConstraints{
    pub sigma:cuckoo::UpperLower,
    pub v0:cuckoo::UpperLower,
    pub speed:cuckoo::UpperLower,
    pub eta_v:cuckoo::UpperLower,
    pub rho:cuckoo::UpperLower
}*/

pub fn get_constraints()->ParameterConstraints {
    ParameterConstraints{
        rate:cuckoo::UpperLower{lower:0.0, upper:0.4},
        asset:cuckoo::UpperLower{lower:0.0, upper:1000000.0},
        maturity:cuckoo::UpperLower{lower:0.0, upper:1000000.0},
        num_u:cuckoo::UpperLower{lower:5.0, upper:10.0},
        quantile:cuckoo::UpperLower{lower:0.0, upper:1.0}
    }
}
/*
pub fn get_constraints()->HashMap<String, cuckoo::UpperLower> {
    vec![
        ("rate", cuckoo::UpperLower{lower:0.0, upper:0.4}),
        ("asset", cuckoo::UpperLower{lower:0.0, upper:1000000.0}),
        ("maturity", cuckoo::UpperLower{lower:0.0, upper:1000000.0}),
        ("num_u", cuckoo::UpperLower{lower:5.0, upper:10.0}),
        ("quantile", cuckoo::UpperLower{lower:0.0, upper:1.0}),
    ].into_iter().collect()
}*/
pub fn get_merton_constraints()->HashMap<String, cuckoo::UpperLower> {
    vec![
        ("lambda".to_string(), cuckoo::UpperLower{lower:0.0, upper:2.0}),
        ("mu_l".to_string(), cuckoo::UpperLower{lower:-1.0, upper:1.0}),
        ("sig_l".to_string(), cuckoo::UpperLower{lower:0.0, upper:2.0}),
        ("sigma".to_string(), cuckoo::UpperLower{lower:0.0, upper:1.0}),
        ("v0".to_string(), cuckoo::UpperLower{lower:0.2, upper:1.8}),
        ("speed".to_string(), cuckoo::UpperLower{lower:0.0, upper:3.0}),
        ("eta_v".to_string(), cuckoo::UpperLower{lower:0.0, upper:3.0}),
        ("rho".to_string(), cuckoo::UpperLower{lower:-1.0, upper:1.0}),
    ].into_iter().collect()
}
pub fn get_cgmy_constraints()->HashMap<String, cuckoo::UpperLower> {
    vec![
        ("c".to_string(), cuckoo::UpperLower{lower:0.0, upper:2.0}),
        ("g".to_string(), cuckoo::UpperLower{lower:0.0, upper:20.0}),
        ("m".to_string(), cuckoo::UpperLower{lower:0.0, upper:20.0}),
        ("y".to_string(), cuckoo::UpperLower{lower:-1.0, upper:2.0}),
        ("sigma".to_string(), cuckoo::UpperLower{lower:0.0, upper:1.0}),
        ("v0".to_string(), cuckoo::UpperLower{lower:0.2, upper:1.8}),
        ("speed".to_string(), cuckoo::UpperLower{lower:0.0, upper:3.0}),
        ("eta_v".to_string(), cuckoo::UpperLower{lower:0.0, upper:3.0}),
        ("rho".to_string(), cuckoo::UpperLower{lower:-1.0, upper:1.0}),
    ].into_iter().collect()
}
pub fn get_heston_constraints()->HashMap<String, cuckoo::UpperLower> {
    vec![
        ("sigma".to_string(), cuckoo::UpperLower{lower:0.0, upper:1.0}),
        ("v0".to_string(), cuckoo::UpperLower{lower:0.001, upper:1.5}),
        ("speed".to_string(), cuckoo::UpperLower{lower:0.0, upper:3.0}),
        ("eta_v".to_string(), cuckoo::UpperLower{lower:0.0, upper:3.0}),
        ("rho".to_string(), cuckoo::UpperLower{lower:-1.0, upper:1.0}),
    ].into_iter().collect()
}


fn check_constraint<'a>(
    parameter:f64,
    constraint:&'a cuckoo::UpperLower,
    parameter_name: &'a str
)->Result<(), io::Error>{
    if parameter>=constraint.lower&&parameter<=constraint.upper{
        Ok(())
    }
    else {
        Err(
            Error::new(ErrorKind::Other, format!("Parameter {} out of bounds", parameter_name))
        )
    }
}
fn get_parameter(
    parameters:&HashMap<String, f64>,
    key:&String
)->Result<f64, io::Error>{
    match parameters.get(key){
        Some(parameter)=>Ok(*parameter),
        None=>Err(
            Error::new(ErrorKind::Other, format!("Parameter {} does not exist", key))
        )
    }
}
fn constraint_fn(
    parameters:&HashMap<String, f64>,
    key:&String,
    value:&cuckoo::UpperLower
)->Result<(), io::Error>{
    let parameter=get_parameter(parameters, key)?;
    check_constraint(parameter, value, key)?;
    Ok(())
}
pub fn check_cf_parameters<'a>(
    parameters:&HashMap<String, f64>,
    constraints:&HashMap<String, cuckoo::UpperLower>
)->Result<(), io::Error> {
    constraints.iter().try_for_each(|(key, value)|{
        constraint_fn(parameters, key, value)
    })?;
    Ok(())
}
pub fn check_parameters<'a>(
    parameters:&OptionParameters,
    constraints:&ParameterConstraints
)->Result<(), io::Error> {
    check_constraint(
        parameters.asset, &constraints.asset, "asset"
    )?;
    check_constraint(
        parameters.maturity, &constraints.maturity, "maturity"
    )?;
    check_constraint(
        parameters.rate, &constraints.rate, "rate"
    )?;
    check_constraint(
        parameters.num_u as f64, &constraints.num_u, "num_u"
    )?;
    check_constraint(
        parameters.quantile, &constraints.quantile, "quantile"
    )?;
    
    Ok(())
}

pub fn throw_no_existing(
    message:&str
)->Result<(), io::Error>{
    Err(
        Error::new(ErrorKind::Other, format!("No matches! {}", message))
    )?
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_check_cf_parameters_missing(){
        let mut parameters=HashMap::new();
        parameters.insert("lambda".to_string(), 0.4);
        let result=check_cf_parameters(
            &parameters,
            &get_merton_constraints()
        );
        assert!(result.is_err(), "Parameter does not exist");
    }
    #[test]
    fn test_check_cf_parameters_out_bounds(){
        let mut parameters=HashMap::new();
        parameters.insert("lambda".to_string(), -50.0);
        let result=check_cf_parameters(
            &parameters,
            &get_merton_constraints()
        );
        assert!(result.is_err(), "Parameter out of bounds");
    }
}
