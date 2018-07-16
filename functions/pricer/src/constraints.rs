extern crate cuckoo;
#[macro_use]
extern crate simple_error;
#[macro_use]
extern crate serde_json;
#[macro_use]
extern crate serde_derive;

#[derive(Serialize, Deserialize)]
struct OptionParameters {
    T: f64,
    r:f64,
    S0:f64,
    lambda:f64,
    muJ:f64,
    sigJ:f64,
    sigma:f64,
    v0:f64,
    speed:f64,
    adaV:f64,
    rho:f64,
    k:VecDeque<f64>,
    quantile:f64,
    numU:usize
}
impl OptionParameters{
    fn extend_k(&mut self, x_max:f64){
        self.k.push_back((-x_max).exp()*self.S0);
        self.k.push_front(x_max.exp()*self.S0);
    }
}

#[derive(Serialize, Deserialize)]
struct ParameterConstraints{
    lambda:cuckoo::UpperLower,
    muJ:cuckoo::UpperLower,
    sigJ:cuckoo::UpperLower,
    sigma:cuckoo::UpperLower,
    v0:cuckoo::UpperLower,
    speed:cuckoo::UpperLower,
    adaV:cuckoo::UpperLower,
    rho:cuckoo::UpperLower,
    r:cuckoo::UpperLower,
    S0:cuckoo::UpperLower,
    T:cuckoo::UpperLower,
    numU:UpperLower,
    quantile:UpperLower
}

fn get_constraints()->ParameterConstraints {
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
        numU:cuckoo::UpperLower{lower:5, upper:10},
        quantile:cuckoo::UpperLower{lower:0.0, upper:1.0}
    }
}
fn check_constraint(
    parameter:f64,
    constraint:&UpperLower,
    parameter_name:&str
)->Result<(), &str>{
    if parameter>constraints.lower&&parameter<constraints.upper{
        Ok(())
    }
    else {
        Err("Parameter out of bounds".to_owned().push_str(parameter))
    }
}
fn check_constraints(
    parameters:&OptionParameters,
    constraints:&ParameterConstraints
)->Result<(), &str> {
    check_constraint(parameters.lambda, constraints.lambda, "lambda")?;
    check_constraint(parameters.muJ, constraints.muJ, "muJ")?;
    check_constraint(parameters.sigJ, constraints.sigJ, "sigJ")?;
    check_constraint(parameters.sigma, constraints.sigma, "sigma")?;
    check_constraint(parameters.v0, constraints.v0, "v0")?;
    check_constraint(parameters.speed, constraints.speed, "speed")?;
    check_constraint(parameters.adaV, constraints.adaV, "adaV")?;
    check_constraint(parameters.rho, constraints.rho, "rho")?;
    check_constraint(parameters.r, constraints.r, "r")?;
    check_constraint(parameters.S0, constraints.S0, "S0")?;
    check_constraint(parameters.T, constraints.T, "T")?;
    check_constraint(parameters.numU as f64, constraints.numU, "numU")?;
    check_constraint(parameters.quantile, constraints.quantile, "quantile")?;
    Ok(())
}
