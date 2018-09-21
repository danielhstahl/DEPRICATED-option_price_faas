extern crate cuckoo;
extern crate serde_json;
#[macro_use]
extern crate serde_derive;

use std::collections::VecDeque;
use std::io;
use std::io::{Error, ErrorKind};

//base
pub const CGMY:i32=0;
pub const MERTON:i32=1;
pub const HESTON:i32=2;
//enhancements to base
pub const VANILLA:i32=0;
pub const STOCHASTIC_VOL:i32=1;
pub const DIFFUSION:i32=2;
pub const LEVERAGE:i32=3;//leverage will include diffusion to generate correlation


#[derive(Serialize, Deserialize)]
pub struct OptionParameters {
    pub maturity: f64,
    pub rate:f64,
    pub asset:f64,
    pub lambda:f64,
    pub mu_l:f64,
    pub sig_l:f64,
    pub sigma:f64,
    pub v0:f64,
    pub speed:f64,
    pub eta_v:f64,
    pub rho:f64,
    pub strikes:VecDeque<f64>,
    pub quantile:f64,
    pub num_u:usize //raised to the power of two.  if this is 8, then there will be 2^8=256 discrete "u"
}
impl OptionParameters{
    pub fn extend_k(&mut self, x_max:f64){
        self.strikes.push_back((-x_max).exp()*self.asset);
        self.strikes.push_front(x_max.exp()*self.asset);
    }
}


#[derive(Serialize, Deserialize)] //can I only do this on structs?
pub struct ParameterConstraints{
    pub lambda:cuckoo::UpperLower,
    pub mu_l:cuckoo::UpperLower,
    pub sig_l:cuckoo::UpperLower,
    pub sigma:cuckoo::UpperLower,
    pub v0:cuckoo::UpperLower,
    pub speed:cuckoo::UpperLower,
    pub eta_v:cuckoo::UpperLower,
    pub rho:cuckoo::UpperLower,
    pub rate:cuckoo::UpperLower,
    pub asset:cuckoo::UpperLower,
    pub maturity:cuckoo::UpperLower,
    pub num_u:cuckoo::UpperLower,
    pub quantile:cuckoo::UpperLower
}

pub fn get_constraints()->ParameterConstraints {
    ParameterConstraints{
        lambda:cuckoo::UpperLower{lower:0.0, upper:2.0},
        mu_l:cuckoo::UpperLower{lower:-1.0, upper:1.0},
        sig_l:cuckoo::UpperLower{lower:0.0, upper:2.0},
        sigma:cuckoo::UpperLower{lower:0.0, upper:1.0},
        v0:cuckoo::UpperLower{lower:0.2, upper:1.8},
        speed:cuckoo::UpperLower{lower:0.0, upper:3.0},
        eta_v:cuckoo::UpperLower{lower:0.0, upper:3.0},
        rho:cuckoo::UpperLower{lower:-1.0, upper:1.0},
        rate:cuckoo::UpperLower{lower:0.0, upper:0.4},
        asset:cuckoo::UpperLower{lower:0.0, upper:1000000.0},
        maturity:cuckoo::UpperLower{lower:0.0, upper:1000000.0},
        num_u:cuckoo::UpperLower{lower:5.0, upper:10.0},
        quantile:cuckoo::UpperLower{lower:0.0, upper:1.0}
    }
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
pub fn check_constraints<'a>(
    parameters:&OptionParameters,
    constraints:&ParameterConstraints
)->Result<(), io::Error> {
    check_constraint(parameters.lambda, &constraints.lambda, "lambda")?;
    check_constraint(parameters.mu_l, &constraints.mu_l, "mu_l")?;
    check_constraint(parameters.sig_l, &constraints.sig_l, "sig_l")?;
    check_constraint(parameters.sigma, &constraints.sigma, "sigma")?;
    check_constraint(parameters.v0, &constraints.v0, "v0")?;
    check_constraint(parameters.speed, &constraints.speed, "speed")?;
    check_constraint(parameters.eta_v, &constraints.eta_v, "eta_v")?;
    check_constraint(parameters.rho, &constraints.rho, "rho")?;
    check_constraint(parameters.rate, &constraints.rate, "rate")?;
    check_constraint(parameters.asset, &constraints.asset, "asset")?;
    check_constraint(parameters.maturity, &constraints.maturity, "maturity")?;
    check_constraint(parameters.num_u as f64, &constraints.num_u, "num_u")?;
    check_constraint(parameters.quantile, &constraints.quantile, "quantile")?;
    Ok(())
}
