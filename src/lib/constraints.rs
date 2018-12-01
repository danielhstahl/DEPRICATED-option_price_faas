//Todo: consider writing a macro to iterate over structs
//structs will allow for static typing and possibly speed
//optimizations vs hashmaps

use std::collections::HashMap;
use std::collections::VecDeque;
use std::io;
use std::io::{Error, ErrorKind};

#[derive(Serialize, Deserialize)]
pub struct ConstraintsSchema {
    pub lower: f64,
    pub upper: f64,
    pub types: String,
}

#[derive(Serialize, Deserialize)]
pub struct OptionParameters {
    pub maturity: f64,
    pub rate: f64,
    pub asset: Option<f64>,
    pub strikes: Option<VecDeque<f64>>,
    pub quantile: Option<f64>,
    pub num_u: usize, //raised to the power of two.  if this is 8, then there will be 2^8=256 discrete "u"
    pub cf_parameters: HashMap<String, f64>,
}

pub fn extend_strikes(mut strikes: VecDeque<f64>, asset: f64, x_max: f64) -> Vec<f64> {
    strikes.push_back((-x_max).exp() * asset);
    strikes.push_front(x_max.exp() * asset);
    Vec::from(strikes)
}

#[derive(Serialize, Deserialize)]
pub struct ParameterConstraints {
    pub rate: ConstraintsSchema,
    pub asset: ConstraintsSchema,
    pub maturity: ConstraintsSchema,
    pub num_u: ConstraintsSchema,
    pub quantile: ConstraintsSchema,
}

pub fn get_constraints() -> ParameterConstraints {
    ParameterConstraints {
        rate: ConstraintsSchema {
            lower: 0.0,
            upper: 0.4,
            types: "float".to_string(),
        },
        asset: ConstraintsSchema {
            lower: 0.0,
            upper: 1000000.0,
            types: "float".to_string(),
        },
        maturity: ConstraintsSchema {
            lower: 0.0,
            upper: 1000000.0,
            types: "float".to_string(),
        },
        num_u: ConstraintsSchema {
            lower: 5.0,
            upper: 10.0,
            types: "int".to_string(),
        },
        quantile: ConstraintsSchema {
            lower: 0.0,
            upper: 1.0,
            types: "float".to_string(),
        },
    }
}

pub fn get_merton_constraints() -> HashMap<String, ConstraintsSchema> {
    vec![
        (
            "lambda".to_string(),
            ConstraintsSchema {
                lower: 0.0,
                upper: 2.0,
                types: "float".to_string(),
            },
        ),
        (
            "mu_l".to_string(),
            ConstraintsSchema {
                lower: -1.0,
                upper: 1.0,
                types: "float".to_string(),
            },
        ),
        (
            "sig_l".to_string(),
            ConstraintsSchema {
                lower: 0.0,
                upper: 2.0,
                types: "float".to_string(),
            },
        ),
        (
            "sigma".to_string(),
            ConstraintsSchema {
                lower: 0.0,
                upper: 1.0,
                types: "float".to_string(),
            },
        ),
        (
            "v0".to_string(),
            ConstraintsSchema {
                lower: 0.2,
                upper: 1.8,
                types: "float".to_string(),
            },
        ),
        (
            "speed".to_string(),
            ConstraintsSchema {
                lower: 0.0,
                upper: 3.0,
                types: "float".to_string(),
            },
        ),
        (
            "eta_v".to_string(),
            ConstraintsSchema {
                lower: 0.0,
                upper: 3.0,
                types: "float".to_string(),
            },
        ),
        (
            "rho".to_string(),
            ConstraintsSchema {
                lower: -1.0,
                upper: 1.0,
                types: "float".to_string(),
            },
        ),
    ]
    .into_iter()
    .collect()
}
pub fn get_cgmy_constraints() -> HashMap<String, ConstraintsSchema> {
    vec![
        (
            "c".to_string(),
            ConstraintsSchema {
                lower: 0.0,
                upper: 2.0,
                types: "float".to_string(),
            },
        ),
        (
            "g".to_string(),
            ConstraintsSchema {
                lower: 0.0,
                upper: 20.0,
                types: "float".to_string(),
            },
        ),
        (
            "m".to_string(),
            ConstraintsSchema {
                lower: 0.0,
                upper: 20.0,
                types: "float".to_string(),
            },
        ),
        (
            "y".to_string(),
            ConstraintsSchema {
                lower: -1.0,
                upper: 2.0,
                types: "float".to_string(),
            },
        ),
        (
            "sigma".to_string(),
            ConstraintsSchema {
                lower: 0.0,
                upper: 1.0,
                types: "float".to_string(),
            },
        ),
        (
            "v0".to_string(),
            ConstraintsSchema {
                lower: 0.2,
                upper: 1.8,
                types: "float".to_string(),
            },
        ),
        (
            "speed".to_string(),
            ConstraintsSchema {
                lower: 0.0,
                upper: 3.0,
                types: "float".to_string(),
            },
        ),
        (
            "eta_v".to_string(),
            ConstraintsSchema {
                lower: 0.0,
                upper: 3.0,
                types: "float".to_string(),
            },
        ),
        (
            "rho".to_string(),
            ConstraintsSchema {
                lower: -1.0,
                upper: 1.0,
                types: "float".to_string(),
            },
        ),
    ]
    .into_iter()
    .collect()
}
pub fn get_heston_constraints() -> HashMap<String, ConstraintsSchema> {
    vec![
        (
            "sigma".to_string(),
            ConstraintsSchema {
                lower: 0.0,
                upper: 1.0,
                types: "float".to_string(),
            },
        ),
        (
            "v0".to_string(),
            ConstraintsSchema {
                lower: 0.001,
                upper: 1.5,
                types: "float".to_string(),
            },
        ),
        (
            "speed".to_string(),
            ConstraintsSchema {
                lower: 0.0,
                upper: 3.0,
                types: "float".to_string(),
            },
        ),
        (
            "eta_v".to_string(),
            ConstraintsSchema {
                lower: 0.0,
                upper: 3.0,
                types: "float".to_string(),
            },
        ),
        (
            "rho".to_string(),
            ConstraintsSchema {
                lower: -1.0,
                upper: 1.0,
                types: "float".to_string(),
            },
        ),
    ]
    .into_iter()
    .collect()
}

fn check_constraint<'a>(
    parameter: f64,
    constraint: &'a ConstraintsSchema,
    parameter_name: &'a str,
) -> Result<(), io::Error> {
    if parameter >= constraint.lower && parameter <= constraint.upper {
        Ok(())
    } else {
        Err(Error::new(
            ErrorKind::Other,
            format!("Parameter {} out of bounds", parameter_name),
        ))
    }
}
fn check_constraint_option<'a>(
    parameter: &Option<f64>,
    constraint: &'a ConstraintsSchema,
    parameter_name: &'a str,
) -> Result<(), io::Error> {
    match parameter {
        Some(param) => check_constraint(*param, constraint, parameter_name),
        None => Ok(()),
    }
}
fn get_parameter(parameters: &HashMap<String, f64>, key: &String) -> Result<f64, io::Error> {
    match parameters.get(key) {
        Some(parameter) => Ok(*parameter),
        None => Err(Error::new(
            ErrorKind::Other,
            format!("Parameter {} does not exist", key),
        )),
    }
}
fn constraint_fn(
    parameters: &HashMap<String, f64>,
    key: &String,
    value: &ConstraintsSchema,
) -> Result<(), io::Error> {
    let parameter = get_parameter(parameters, key)?;
    check_constraint(parameter, value, key)?;
    Ok(())
}
pub fn check_cf_parameters<'a>(
    parameters: &HashMap<String, f64>,
    constraints: &HashMap<String, ConstraintsSchema>,
) -> Result<(), io::Error> {
    constraints
        .iter()
        .try_for_each(|(key, value)| constraint_fn(parameters, key, value))?;
    Ok(())
}
pub fn check_parameters<'a>(
    parameters: &OptionParameters,
    constraints: &ParameterConstraints,
) -> Result<(), io::Error> {
    check_constraint_option(&parameters.asset, &constraints.asset, "asset")?;
    check_constraint(parameters.maturity, &constraints.maturity, "maturity")?;
    check_constraint(parameters.rate, &constraints.rate, "rate")?;
    check_constraint(parameters.num_u as f64, &constraints.num_u, "num_u")?;
    check_constraint_option(&parameters.quantile, &constraints.quantile, "quantile")?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_check_constraint_option() {
        let constraint = ConstraintsSchema {
            lower: 0.0,
            upper: 1.0,
            types: "float".to_string(),
        };
        let parameter = Some(0.5);
        let result = check_constraint_option(&parameter, &constraint, "hello");
        assert!(result.is_ok());
    }
    #[test]
    fn test_check_constraint_option_failure() {
        let constraint = ConstraintsSchema {
            lower: 0.0,
            upper: 1.0,
            types: "float".to_string(),
        };
        let parameter = None;
        let result = check_constraint_option(&parameter, &constraint, "hello");
        assert!(result.is_err(), "Parameter hello does not exist");
    }
    #[test]
    fn test_check_constraint_option_failure_bounds() {
        let constraint = ConstraintsSchema {
            lower: 0.0,
            upper: 1.0,
            types: "float".to_string(),
        };
        let parameter = Some(5.0);
        let result = check_constraint_option(&parameter, &constraint, "hello");
        assert!(result.is_err(), "Parameter hello out of bounds");
    }
    #[test]
    fn test_check_cf_parameters_missing() {
        let mut parameters = HashMap::new();
        parameters.insert("lambda".to_string(), 0.4);
        let result = check_cf_parameters(&parameters, &get_merton_constraints());
        assert!(result.is_err(), "Parameter does not exist");
    }
    #[test]
    fn test_check_cf_parameters_out_bounds() {
        let mut parameters = HashMap::new();
        parameters.insert("lambda".to_string(), -50.0);
        let result = check_cf_parameters(&parameters, &get_merton_constraints());
        assert!(result.is_err(), "Parameter out of bounds");
    }
}
