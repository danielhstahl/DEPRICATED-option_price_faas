extern crate cuckoo;

use std::collections::VecDeque;
use std::io;
use std::io::{Error, ErrorKind};

#[derive(Serialize, Deserialize)]
pub struct OptionParameters {
    pub T: f64,
    pub r:f64,
    pub S0:f64,
    pub lambda:f64,
    pub muJ:f64,
    pub sigJ:f64,
    pub sigma:f64,
    pub v0:f64,
    pub speed:f64,
    pub adaV:f64,
    pub rho:f64,
    pub k:VecDeque<f64>,
    pub quantile:f64,
    pub numU:usize
}
impl OptionParameters{
    pub fn extend_k(&mut self, x_max:f64){
        self.k.push_back((-x_max).exp()*self.S0);
        self.k.push_front(x_max.exp()*self.S0);
    }
}


#[derive(Serialize, Deserialize)] //can I only do this on structs?
pub struct ParameterConstraints{
    pub lambda:cuckoo::UpperLower,
    pub muJ:cuckoo::UpperLower,
    pub sigJ:cuckoo::UpperLower,
    pub sigma:cuckoo::UpperLower,
    pub v0:cuckoo::UpperLower,
    pub speed:cuckoo::UpperLower,
    pub adaV:cuckoo::UpperLower,
    pub rho:cuckoo::UpperLower,
    pub r:cuckoo::UpperLower,
    pub S0:cuckoo::UpperLower,
    pub T:cuckoo::UpperLower,
    pub numU:cuckoo::UpperLower,
    pub quantile:cuckoo::UpperLower
}

pub fn get_constraints()->ParameterConstraints {
    ParameterConstraints{
        lambda:cuckoo::UpperLower{lower:0.0, upper:2.0},
        muJ:cuckoo::UpperLower{lower:-1.0, upper:1.0},
        sigJ:cuckoo::UpperLower{lower:0.0, upper:2.0},
        sigma:cuckoo::UpperLower{lower:0.0, upper:1.0},
        v0:cuckoo::UpperLower{lower:0.2, upper:1.8},
        speed:cuckoo::UpperLower{lower:0.0, upper:3.0},
        adaV:cuckoo::UpperLower{lower:0.0, upper:3.0},
        rho:cuckoo::UpperLower{lower:-1.0, upper:1.0},
        r:cuckoo::UpperLower{lower:0.0, upper:0.4},
        S0:cuckoo::UpperLower{lower:0.0, upper:1000000.0},
        T:cuckoo::UpperLower{lower:0.0, upper:1000000.0},
        numU:cuckoo::UpperLower{lower:5.0, upper:10.0},
        quantile:cuckoo::UpperLower{lower:0.0, upper:1.0}
    }
}
fn check_constraint<'a>(
    parameter:f64,
    constraint:&'a cuckoo::UpperLower,
    parameter_name: &'a str
)->Result<(), io::Error>{
    if parameter>constraint.lower&&parameter<constraint.upper{
        Ok(())
    }
    else {
        Err(
            Error::new(ErrorKind::Other, format!("Parameter out of bounds{}", parameter))
        )
    }
}
pub fn check_constraints<'a>(
    parameters:&OptionParameters,
    constraints:&ParameterConstraints
)->Result<(), io::Error> {
    check_constraint(parameters.lambda, &constraints.lambda, "lambda")?;
    check_constraint(parameters.muJ, &constraints.muJ, "muJ")?;
    check_constraint(parameters.sigJ, &constraints.sigJ, "sigJ")?;
    check_constraint(parameters.sigma, &constraints.sigma, "sigma")?;
    check_constraint(parameters.v0, &constraints.v0, "v0")?;
    check_constraint(parameters.speed, &constraints.speed, "speed")?;
    check_constraint(parameters.adaV, &constraints.adaV, "adaV")?;
    check_constraint(parameters.rho, &constraints.rho, "rho")?;
    check_constraint(parameters.r, &constraints.r, "r")?;
    check_constraint(parameters.S0, &constraints.S0, "S0")?;
    check_constraint(parameters.T, &constraints.T, "T")?;
    check_constraint(parameters.numU as f64, &constraints.numU, "numU")?;
    check_constraint(parameters.quantile, &constraints.quantile, "quantile")?;
    Ok(())
}
