extern crate black_scholes;
extern crate cf_dist_utils;
extern crate cf_functions;
extern crate fang_oost;
extern crate fang_oost_option;
extern crate num_complex;
#[cfg(test)]
extern crate rand;
extern crate rayon;
extern crate serde;
use self::fang_oost_option::option_pricing;
use self::num_complex::Complex;
#[cfg(test)]
use self::rand::distributions::Distribution;
#[cfg(test)]
use self::rand::distributions::Uniform;
#[cfg(test)]
use self::rand::{SeedableRng, StdRng};
use self::rayon::prelude::*;
use constraints;
use std::collections::VecDeque;

pub const CGMY: i32 = 0;
pub const MERTON: i32 = 1;
pub const HESTON: i32 = 2;

pub const PUT_PRICE: i32 = 0;
pub const CALL_PRICE: i32 = 1;

pub const PUT_DELTA: i32 = 2;
pub const CALL_DELTA: i32 = 3;

pub const PUT_GAMMA: i32 = 4;
pub const CALL_GAMMA: i32 = 5;

pub const PUT_THETA: i32 = 6;
pub const CALL_THETA: i32 = 7;

pub const DENSITY: i32 = 8;
pub const RISK_MEASURES: i32 = 9;

/// Gets indicators for which sensitivity
/// to retrieve
/// # Examples
///
/// ```
/// extern crate utils;
/// use utils::maps;
/// # fn main() {
/// let sensitivity = maps::get_fn_indicators(
///     "put",
///     "price"
/// ).unwrap();
/// # }
/// ```
pub fn get_fn_indicators(
    option_type: &str,
    sensitivity: &str,
) -> Result<i32, constraints::ParameterError> {
    let combine_types = format!("{}_{}", option_type, sensitivity);
    match combine_types.as_str() {
        "put_price" => Ok(PUT_PRICE),
        "call_price" => Ok(CALL_PRICE),
        "put_delta" => Ok(PUT_DELTA),
        "call_delta" => Ok(CALL_DELTA),
        "put_gamma" => Ok(PUT_GAMMA),
        "call_gamma" => Ok(CALL_GAMMA),
        "put_theta" => Ok(PUT_THETA),
        "call_theta" => Ok(CALL_THETA),
        "density_" => Ok(DENSITY),
        "riskmetric_" => Ok(RISK_MEASURES),
        _ => Err(constraints::ParameterError::new(
            &constraints::ErrorType::FunctionError(combine_types),
        )),
    }
}
/// Gets whether implied volatility should be included
/// # Examples
///
/// ```
/// extern crate utils;
/// use utils::maps;
/// # fn main() {
/// let include_iv = maps::get_iv_choice(
///     &"true"
/// );
/// assert!(include_iv);
/// # }
/// ```
pub fn get_iv_choice(query: &str) -> bool {
    match query {
        "true" => true,
        _ => false,
    }
}

fn get_cgmy_cf(
    cf_parameters: &constraints::CGMYParameters,
    maturity: f64,
    rate: f64,
) -> Result<(impl Fn(&Complex<f64>) -> Complex<f64>, f64), constraints::ParameterError> {
    constraints::check_cgmy_parameters(&cf_parameters, &constraints::get_cgmy_constraints())?;
    let constraints::CGMYParameters {
        c,
        g,
        m,
        y,
        sigma,
        v0,
        speed,
        eta_v,
        rho,
    } = cf_parameters;
    let cf_inst = cf_functions::cgmy_time_change_cf(
        maturity, rate, *c, *g, *m, *y, *sigma, *v0, *speed, *eta_v, *rho,
    );
    let vol = cf_functions::cgmy_diffusion_vol(*sigma, *c, *g, *m, *y, maturity);
    Ok((cf_inst, vol))
}
fn get_merton_cf(
    cf_parameters: &constraints::MertonParameters,
    maturity: f64,
    rate: f64,
) -> Result<(impl Fn(&Complex<f64>) -> Complex<f64>, f64), constraints::ParameterError> {
    constraints::check_merton_parameters(&cf_parameters, &constraints::get_merton_constraints())?;
    let constraints::MertonParameters {
        lambda,
        mu_l,
        sig_l,
        sigma,
        v0,
        speed,
        eta_v,
        rho,
    } = cf_parameters;
    let cf_inst = cf_functions::merton_time_change_cf(
        maturity, rate, *lambda, *mu_l, *sig_l, *sigma, *v0, *speed, *eta_v, *rho,
    );
    let vol = cf_functions::jump_diffusion_vol(*sigma, *lambda, *mu_l, *sig_l, maturity);
    Ok((cf_inst, vol))
}
fn get_heston_cf(
    cf_parameters: &constraints::HestonParameters,
    maturity: f64,
    rate: f64,
) -> Result<(impl Fn(&Complex<f64>) -> Complex<f64>, f64), constraints::ParameterError> {
    constraints::check_heston_parameters(&cf_parameters, &constraints::get_heston_constraints())?;
    let constraints::HestonParameters {
        sigma,
        v0,
        speed,
        eta_v,
        rho,
    } = cf_parameters;
    let cf_inst = cf_functions::heston_cf(maturity, rate, *sigma, *v0, *speed, *eta_v, *rho);
    Ok((cf_inst, *sigma))
}

pub fn get_option_results_as_json(
    fn_choice: i32,
    include_iv: bool,
    cf_parameters: &constraints::CFParameters,
    option_scale: f64,
    num_u: usize,
    asset: f64,
    maturity: f64,
    rate: f64,
    strikes: VecDeque<f64>,
) -> Result<Vec<GraphElement>, constraints::ParameterError> {
    match cf_parameters {
        constraints::CFParameters::CGMY(cf_params) => {
            let (cf_inst, vol) = get_cgmy_cf(cf_params, maturity, rate)?;
            let x_max_options = option_scale * vol;
            get_option_results(
                fn_choice,
                include_iv,
                num_u,
                asset,
                rate,
                maturity,
                &constraints::extend_strikes(strikes, asset, x_max_options),
                &cf_inst,
            )
        }
        constraints::CFParameters::Merton(cf_params) => {
            let (cf_inst, vol) = get_merton_cf(cf_params, maturity, rate)?;
            let x_max_options = option_scale * vol;
            get_option_results(
                fn_choice,
                include_iv,
                num_u,
                asset,
                rate,
                maturity,
                &constraints::extend_strikes(strikes, asset, x_max_options),
                &cf_inst,
            )
        }
        constraints::CFParameters::Heston(cf_params) => {
            let (cf_inst, vol) = get_heston_cf(cf_params, maturity, rate)?;
            let x_max_options = option_scale * vol;
            get_option_results(
                fn_choice,
                include_iv,
                num_u,
                asset,
                rate,
                maturity,
                &constraints::extend_strikes(strikes, asset, x_max_options),
                &cf_inst,
            )
        }
    }
}
pub fn get_density_results_as_json(
    cf_parameters: &constraints::CFParameters,
    density_scale: f64,
    num_u: usize,
    maturity: f64,
    rate: f64,
) -> Result<Vec<GraphElement>, constraints::ParameterError> {
    match cf_parameters {
        constraints::CFParameters::CGMY(cf_params) => {
            let (cf_inst, vol) = get_cgmy_cf(cf_params, maturity, rate)?;
            let x_max_density = vol * density_scale;
            get_density_results(num_u, x_max_density, &cf_inst)
        }
        constraints::CFParameters::Merton(cf_params) => {
            let (cf_inst, vol) = get_merton_cf(cf_params, maturity, rate)?;
            let x_max_density = vol * density_scale;
            get_density_results(num_u, x_max_density, &cf_inst)
        }
        constraints::CFParameters::Heston(cf_params) => {
            let (cf_inst, vol) = get_heston_cf(cf_params, maturity, rate)?;
            let x_max_density = vol * density_scale;
            get_density_results(num_u, x_max_density, &cf_inst)
        }
    }
}
pub fn get_risk_measure_results_as_json(
    cf_parameters: &constraints::CFParameters,
    density_scale: f64,
    num_u: usize,
    maturity: f64,
    rate: f64,
    quantile: f64,
) -> Result<RiskMeasures, constraints::ParameterError> {
    match cf_parameters {
        constraints::CFParameters::CGMY(cf_params) => {
            let (cf_inst, vol) = get_cgmy_cf(cf_params, maturity, rate)?;
            let x_max_density = vol * density_scale;
            get_risk_measure_results(num_u, x_max_density, quantile, &cf_inst)
        }
        constraints::CFParameters::Merton(cf_params) => {
            let (cf_inst, vol) = get_merton_cf(cf_params, maturity, rate)?;
            let x_max_density = vol * density_scale;
            get_risk_measure_results(num_u, x_max_density, quantile, &cf_inst)
        }
        constraints::CFParameters::Heston(cf_params) => {
            let (cf_inst, vol) = get_heston_cf(cf_params, maturity, rate)?;
            let x_max_density = vol * density_scale;
            get_risk_measure_results(num_u, x_max_density, quantile, &cf_inst)
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GraphElement {
    at_point: f64,
    value: f64,
    #[serde(skip_serializing_if = "Option::is_none")] //skip when iv is not provided
    iv: Option<f64>,
}
#[derive(Serialize, Deserialize, Debug)]
pub struct RiskMeasures {
    value_at_risk: f64,
    expected_shortfall: f64,
}

fn risk_measure_as_json(risk_measure: (f64, f64)) -> RiskMeasures {
    let (expected_shortfall, value_at_risk) = risk_measure;
    RiskMeasures {
        value_at_risk,
        expected_shortfall,
    }
}

fn create_generic_iterator<'a, 'b: 'a>(
    x_values: &'b [f64],
    values: &'b [f64],
) -> impl Iterator<Item = (usize, (&'a f64, &'a f64))> + 'a {
    let x_val_crit = values.len() - 1;
    x_values
        .into_iter()
        .zip(values)
        .enumerate()
        .filter(move |(index, _)| index > &0 && index < &x_val_crit)
}

fn density_as_json(x_values: &[f64], values: &[f64]) -> Vec<GraphElement> {
    x_values
        .iter()
        .zip(values.iter())
        .map(|(x_val, val)| GraphElement {
            at_point: *x_val,
            value: *val,
            iv: None,
        })
        .collect::<Vec<_>>()
}

fn graph_no_iv_as_json(x_values: &[f64], values: &[f64]) -> Vec<GraphElement> {
    create_generic_iterator(x_values, values)
        .map(|(_, (x_val, val))| GraphElement {
            at_point: *x_val,
            value: *val,
            iv: None,
        })
        .collect::<Vec<_>>()
}
fn graph_iv_as_json(
    x_values: &[f64],
    values: &[f64],
    iv_fn: &Fn(f64, f64) -> f64,
) -> Vec<GraphElement> {
    create_generic_iterator(x_values, values)
        .map(|(_, (strike, price))| {
            let iv = iv_fn(*price, *strike);
            GraphElement {
                at_point: *strike,
                value: *price,
                iv: Some(iv),
            }
        })
        .collect::<Vec<_>>()
}

fn call_iv_as_json(
    x_values: &[f64],
    values: &[f64],
    asset: f64,
    rate: f64,
    maturity: f64,
) -> Vec<GraphElement> {
    graph_iv_as_json(x_values, values, &|price, strike| {
        black_scholes::call_iv(price, asset, strike, rate, maturity)
    })
}
fn put_iv_as_json(
    x_values: &[f64],
    values: &[f64],
    asset: f64,
    rate: f64,
    maturity: f64,
) -> Vec<GraphElement> {
    graph_iv_as_json(x_values, values, &|price, strike| {
        black_scholes::put_iv(price, asset, strike, rate, maturity)
    })
}

const NUM_X: usize = 128;
fn adjust_density<T>(num_u: usize, x_max: f64, cf: T) -> Vec<GraphElement>
where
    T: Fn(&Complex<f64>) -> Complex<f64> + std::marker::Sync + std::marker::Send,
{
    let x_min = -x_max;
    let x_domain = fang_oost::get_x_domain(NUM_X, x_min, x_max).collect::<Vec<_>>();
    let discrete_cf = fang_oost::get_discrete_cf(num_u, x_min, x_max, &cf);
    let option_range: Vec<f64> = fang_oost::get_density(
        x_min,
        x_max,
        fang_oost::get_x_domain(NUM_X, x_min, x_max),
        &discrete_cf,
    )
    .collect();
    density_as_json(&x_domain, &option_range)
}

fn get_option_results(
    fn_choice: i32,
    include_iv: bool,
    num_u: usize,
    asset: f64,
    rate: f64,
    maturity: f64,
    strikes: &[f64],
    inst_cf: &(Fn(&Complex<f64>) -> Complex<f64> + std::marker::Sync),
) -> Result<Vec<GraphElement>, constraints::ParameterError> {
    match fn_choice {
        CALL_PRICE => {
            let prices = option_pricing::fang_oost_call_price(
                num_u, asset, &strikes, rate, maturity, &inst_cf,
            );
            if include_iv {
                Ok(call_iv_as_json(&strikes, &prices, asset, rate, maturity))
            } else {
                Ok(graph_no_iv_as_json(&strikes, &prices))
            }
        }
        PUT_PRICE => {
            let prices = option_pricing::fang_oost_put_price(
                num_u, asset, &strikes, rate, maturity, &inst_cf,
            );
            if include_iv {
                Ok(put_iv_as_json(&strikes, &prices, asset, rate, maturity))
            } else {
                Ok(graph_no_iv_as_json(&strikes, &prices))
            }
        }
        CALL_DELTA => Ok(graph_no_iv_as_json(
            &strikes,
            &option_pricing::fang_oost_call_delta(num_u, asset, &strikes, rate, maturity, &inst_cf),
        )),
        PUT_DELTA => Ok(graph_no_iv_as_json(
            &strikes,
            &option_pricing::fang_oost_put_delta(num_u, asset, &strikes, rate, maturity, &inst_cf),
        )),
        CALL_GAMMA => Ok(graph_no_iv_as_json(
            &strikes,
            &option_pricing::fang_oost_call_gamma(num_u, asset, &strikes, rate, maturity, &inst_cf),
        )),
        PUT_GAMMA => Ok(graph_no_iv_as_json(
            &strikes,
            &option_pricing::fang_oost_put_gamma(num_u, asset, &strikes, rate, maturity, &inst_cf),
        )),
        CALL_THETA => Ok(graph_no_iv_as_json(
            &strikes,
            &option_pricing::fang_oost_call_theta(num_u, asset, &strikes, rate, maturity, &inst_cf),
        )),
        PUT_THETA => Ok(graph_no_iv_as_json(
            &strikes,
            &option_pricing::fang_oost_put_theta(num_u, asset, &strikes, rate, maturity, &inst_cf),
        )),
        _ => Err(constraints::ParameterError::new(
            &constraints::ErrorType::FunctionError(format!("{}", fn_choice)),
        )),
    }
}
fn get_density_results(
    num_u: usize,
    x_max_density: f64,
    inst_cf: &(Fn(&Complex<f64>) -> Complex<f64> + std::marker::Sync),
) -> Result<Vec<GraphElement>, constraints::ParameterError> {
    Ok(adjust_density(num_u, x_max_density, &inst_cf))
}
const MAX_SIMS: usize = 100;
const PRECISION: f64 = 0.0000001;

fn get_risk_measure_results(
    num_u: usize,
    x_max_density: f64,
    quantile: f64,
    inst_cf: &(Fn(&Complex<f64>) -> Complex<f64> + std::marker::Sync),
) -> Result<RiskMeasures, constraints::ParameterError> {
    Ok(risk_measure_as_json(
        cf_dist_utils::get_expected_shortfall_and_value_at_risk(
            quantile,
            num_u,
            -x_max_density,
            x_max_density,
            MAX_SIMS,
            PRECISION,
            &inst_cf,
        ),
    ))
}

#[cfg(test)]
mod tests {
    use maps::*;
    #[test]
    fn get_fn_indicators_gets_match() {
        let model = get_fn_indicators("put", "price").unwrap();
        assert_eq!(model, PUT_PRICE);
    }
    fn get_rng_seed(seed: [u8; 32]) -> StdRng {
        SeedableRng::from_seed(seed)
    }
    fn get_over_region(lower: f64, upper: f64, rand: f64) -> f64 {
        lower + (upper - lower) * rand
    }
    #[test]
    fn test_many_inputs() {
        let seed: [u8; 32] = [2; 32];
        let mut rng_seed = get_rng_seed(seed);
        let uniform = Uniform::new(0.0f64, 1.0);
        let constr = constraints::get_merton_constraints();
        let asset = 178.46;
        let num_u = 256;
        let strikes = vec![
            95.0, 130.0, 150.0, 160.0, 165.0, 170.0, 175.0, 185.0, 190.0, 195.0, 200.0, 210.0,
            240.0, 250.0,
        ];
        let maturity = 0.86;
        let rate = 0.02;
        let num_total: usize = 10000;
        let mut num_bad: usize = 0;
        (0..num_total).for_each(|_| {
            let lambda_sim = get_over_region(
                constr.lambda.lower,
                constr.lambda.upper,
                uniform.sample(&mut rng_seed),
            );
            let mu_l_sim = get_over_region(
                constr.mu_l.lower,
                constr.mu_l.upper,
                uniform.sample(&mut rng_seed),
            );
            let sig_l_sim = get_over_region(
                constr.sig_l.lower,
                constr.sig_l.upper,
                uniform.sample(&mut rng_seed),
            );
            let sigma_sim = get_over_region(
                constr.sigma.lower,
                constr.sigma.upper,
                uniform.sample(&mut rng_seed),
            );
            let v0_sim = get_over_region(
                constr.v0.lower,
                constr.v0.upper,
                uniform.sample(&mut rng_seed),
            );
            let speed_sim = get_over_region(
                constr.speed.lower,
                constr.speed.upper,
                uniform.sample(&mut rng_seed),
            );
            let eta_v_sim = get_over_region(
                constr.eta_v.lower,
                constr.eta_v.upper,
                uniform.sample(&mut rng_seed),
            );
            let rho_sim = get_over_region(
                constr.rho.lower,
                constr.rho.upper,
                uniform.sample(&mut rng_seed),
            );

            let inst_cf = cf_functions::merton_time_change_cf(
                maturity, rate, lambda_sim, mu_l_sim, sig_l_sim, sigma_sim, v0_sim, speed_sim,
                eta_v_sim, rho_sim,
            );
            let opt_prices = option_pricing::fang_oost_call_price(
                num_u, asset, &strikes, rate, maturity, &inst_cf,
            );

            for option_price in opt_prices.iter() {
                if option_price.is_nan() || option_price.is_infinite() {
                    println!("lambda: {}", lambda_sim);
                    println!("mu_l: {}", mu_l_sim);
                    println!("sig_l: {}", sig_l_sim);
                    println!("sigma: {}", sigma_sim);
                    println!("v0: {}", v0_sim);
                    println!("speed: {}", speed_sim);
                    println!("eta_v: {}", eta_v_sim);
                    println!("rho: {}", rho_sim);
                    num_bad = num_bad + 1;
                    break;
                }
            }
        });
        let bad_rate = (num_bad as f64) / (num_total as f64);
        println!("Bad rate: {}", bad_rate);
        assert_eq!(bad_rate, 0.0);
    }
    #[test]
    fn for_some_extreme_values() {
        let asset = 223.4000;
        let rate = 0.0247;
        let maturity = 0.7599;
        let eta_v = 1.3689;
        let lambda = 0.0327;
        let mu_l = -0.3571;
        let rho = -0.0936;
        let sig_l = 0.5876;
        let sigma = 0.2072;
        let speed = 0.87;
        let v0 = 1.2104;

        let x_max = cf_functions::jump_diffusion_vol(sigma, lambda, mu_l, sig_l, maturity) * 10.0;
        let strikes = vec![
            asset * (x_max.exp()),
            85.0,
            90.0,
            100.0,
            110.0,
            120.0,
            125.0,
            130.0,
            135.0,
            140.0,
            145.0,
            150.0,
            155.0,
            160.0,
            165.0,
            170.0,
            175.0,
            180.0,
            185.0,
            190.0,
            195.0,
            200.0,
            205.0,
            210.0,
            215.0,
            220.0,
            225.0,
            230.0,
            235.0,
            240.0,
            245.0,
            250.0,
            255.0,
            260.0,
            265.0,
            270.0,
            275.0,
            280.0,
            285.0,
            290.0,
            295.0,
            300.0,
            310.0,
            320.0,
            330.0,
            340.0,
            asset * ((-x_max).exp()),
        ];
        let inst_cf = cf_functions::merton_time_change_cf(
            maturity, rate, lambda, mu_l, sig_l, sigma, v0, speed, eta_v, rho,
        );
        let num_u = 256;
        let prices =
            option_pricing::fang_oost_call_price(num_u, asset, &strikes, rate, maturity, &inst_cf);
        call_iv_as_json(&strikes, &prices, asset, rate, maturity);
    }
    #[test]
    fn get_fn_indicators_no_match() {
        assert_eq!(
            get_fn_indicators(&"something".to_string(), &"somethingelse".to_string())
                .unwrap_err()
                .to_string(),
            "Function indicator something_somethingelse does not exist."
        );
    }
    #[test]
    fn test_cgmy_price_1() {
        //https://mpra.ub.uni-muenchen.de/8914/4/MPRA_paper_8914.pdf pg 18
        //S0 = 100, K = 100, r = 0.1, q = 0, C = 1, G = 5, M = 5, T = 1, Y=0.5
        let parameters = constraints::CGMYParameters {
            sigma: 0.0,
            c: 1.0,
            g: 5.0,
            m: 5.0,
            y: 0.5,
            speed: 0.0,
            v0: 1.0,
            eta_v: 0.0,
            rho: 0.0,
        };
        let mut strikes: VecDeque<f64> = VecDeque::new();
        strikes.push_back(100.0);
        let num_u: usize = 256;
        let t = 1.0;
        let rate = 0.1;
        let asset = 100.0;
        let results = get_option_results_as_json(
            CALL_PRICE,
            true,
            &constraints::CFParameters::CGMY(parameters),
            10.0,
            num_u,
            asset,
            t,
            rate,
            strikes,
        )
        .unwrap();
        assert_abs_diff_eq!(results[0].value, 19.812948843, epsilon = 0.00001);
    }
    #[test]
    fn test_cgmy_price_2() {
        //https://mpra.ub.uni-muenchen.de/8914/4/MPRA_paper_8914.pdf pg 18
        //S0 = 100, K = 100, r = 0.1, q = 0, C = 1, G = 5, M = 5, T = 1, Y=1.5
        let parameters = constraints::CGMYParameters {
            sigma: 0.0,
            c: 1.0,
            g: 5.0,
            m: 5.0,
            y: 1.5,
            speed: 0.0,
            v0: 1.0,
            eta_v: 0.0,
            rho: 0.0,
        };
        let mut strikes: VecDeque<f64> = VecDeque::new();
        strikes.push_back(100.0);
        let num_u: usize = 256;
        let t = 1.0;
        let rate = 0.1;
        let asset = 100.0;
        let results = get_option_results_as_json(
            CALL_PRICE,
            false,
            &constraints::CFParameters::CGMY(parameters),
            10.0,
            num_u,
            asset,
            t,
            rate,
            strikes,
        )
        .unwrap();
        assert_abs_diff_eq!(results[0].value, 49.790905469, epsilon = 0.00001);
    }
    #[test]
    fn test_cgmy_price_3() {
        //https://mpra.ub.uni-muenchen.de/8914/4/MPRA_paper_8914.pdf pg 18
        //S0 = 100, K = 100, r = 0.1, q = 0, C = 1, G = 5, M = 5, T = 1, Y=1.98
        let parameters = constraints::CGMYParameters {
            sigma: 0.0,
            c: 1.0,
            g: 5.0,
            m: 5.0,
            y: 1.98,
            speed: 0.0,
            v0: 1.0,
            eta_v: 0.0,
            rho: 0.0,
        };
        let mut strikes: VecDeque<f64> = VecDeque::new();
        strikes.push_back(100.0);
        let num_u: usize = 256;
        let t = 1.0;
        let rate = 0.1;
        let asset = 100.0;
        let results = get_option_results_as_json(
            CALL_PRICE,
            false,
            &constraints::CFParameters::CGMY(parameters),
            10.0,
            num_u,
            asset,
            t,
            rate,
            strikes,
        )
        .unwrap();
        assert_abs_diff_eq!(results[0].value, 99.999905510, epsilon = 0.00001);
    }
    #[test]
    fn test_merton_price() {
        //https://www.upo.es/personal/jfernav/papers/Jumps_JOD_.pdf pg 8
        let sig_l = 0.05_f64.sqrt();
        let mu_l = -sig_l.powi(2) * 0.5;
        let parameters = constraints::MertonParameters {
            sigma: sig_l,
            lambda: 1.0,
            mu_l,
            sig_l,
            speed: 0.0,
            v0: 1.0,
            eta_v: 0.0,
            rho: 0.0,
        };
        let mut strikes: VecDeque<f64> = VecDeque::new();
        strikes.push_back(35.0);
        let num_u: usize = 256;
        let t = 0.5;
        let rate = 0.1;
        let asset = 38.0;
        let results = get_option_results_as_json(
            CALL_PRICE,
            false,
            &constraints::CFParameters::Merton(parameters),
            10.0,
            num_u,
            asset,
            t,
            rate,
            strikes,
        )
        .unwrap();
        assert_abs_diff_eq!(results[0].value, 5.9713, epsilon = 0.0001);
    }
    #[test]
    fn test_merton_price_subset_heston() {
        //https://mpra.ub.uni-muenchen.de/8914/4/MPRA_paper_8914.pdf pg 15
        let sig_l = 0.0;
        let mu_l = 0.0;
        let b: f64 = 0.0398;
        let a = 1.5768;
        let c = 0.5751;
        let rho = -0.5711;
        let v0 = 0.0175;
        let parameters = constraints::MertonParameters {
            sigma: b.sqrt(),
            lambda: 0.0,
            mu_l,
            sig_l,
            speed: a,
            v0: v0 / b,
            eta_v: c / b.sqrt(),
            rho,
        };
        let mut strikes: VecDeque<f64> = VecDeque::new();
        strikes.push_back(100.0);
        let num_u: usize = 256;
        let t = 1.0;
        let rate = 0.0;
        let asset = 100.0;
        let results = get_option_results_as_json(
            CALL_PRICE,
            false,
            &constraints::CFParameters::Merton(parameters),
            10.0,
            num_u,
            asset,
            t,
            rate,
            strikes,
        )
        .unwrap();
        assert_abs_diff_eq!(results[0].value, 5.78515545, epsilon = 0.0001);
    }
    #[test]
    fn test_heston() {
        //https://mpra.ub.uni-muenchen.de/8914/4/MPRA_paper_8914.pdf pg 15
        let b: f64 = 0.0398;
        let a = 1.5768;
        let c = 0.5751;
        let rho = -0.5711;
        let v0 = 0.0175;
        let parameters = constraints::HestonParameters {
            sigma: b.sqrt(),
            speed: a,
            v0,
            eta_v: c,
            rho,
        };
        let mut strikes: VecDeque<f64> = VecDeque::new();
        strikes.push_back(100.0);
        let num_u: usize = 256;
        let t = 1.0;
        let rate = 0.0;
        let asset = 100.0;
        let results = get_option_results_as_json(
            CALL_PRICE,
            false,
            &constraints::CFParameters::Heston(parameters),
            10.0,
            num_u,
            asset,
            t,
            rate,
            strikes,
        )
        .unwrap();
        assert_abs_diff_eq!(results[0].value, 5.78515545, epsilon = 0.0001);
    }
    #[test]
    fn test_monte_carlo() {
        //https://github.com/phillyfan1138/fang_oost_cal_charts/blob/master/docs/OptionCalculation.Rnw
        let parameters = constraints::MertonParameters {
            sigma: 0.2,
            lambda: 0.5,
            mu_l: -0.05,
            sig_l: 0.1,
            speed: 0.3,
            v0: 0.9,
            eta_v: 0.2,
            rho: -0.5,
        };
        let mut strikes: VecDeque<f64> = VecDeque::new();
        strikes.push_back(50.0);
        let num_u: usize = 256;
        let t = 1.0;
        let rate = 0.03;
        let asset = 50.0;
        let results = get_option_results_as_json(
            CALL_PRICE,
            false,
            &constraints::CFParameters::Merton(parameters),
            10.0,
            num_u,
            asset,
            t,
            rate,
            strikes,
        )
        .unwrap();
        //MC price is 4.793274
        assert!(results[0].value > 4.781525);
        assert!(results[0].value < 4.805023);
    }
    #[test]
    fn test_risk_measures() {
        //https://github.com/phillyfan1138/levy-functions/issues/27
        let parameters = constraints::MertonParameters {
            sigma: 0.3183,
            lambda: 0.204516,
            mu_l: -0.302967,
            sig_l: 0.220094,
            speed: 2.6726,
            v0: 0.237187,
            eta_v: 0.0,
            rho: -0.182754,
        };
        let num_u: usize = 256;
        let t = 0.187689;
        let rate = 0.004;
        let quantile = 0.01;
        let results = get_risk_measure_results_as_json(
            &constraints::CFParameters::Merton(parameters),
            5.0,
            num_u,
            t,
            rate,
            quantile,
        )
        .unwrap();
        assert_abs_diff_eq!(results.value_at_risk, 0.261503, epsilon = 0.00001);
    }
    #[test]
    fn test_error_for_out_of_bounds_constant() {
        let sig_l = 0.05_f64.sqrt();
        let mu_l = -sig_l.powi(2) * 0.5;
        let parameters = constraints::MertonParameters {
            sigma: sig_l,
            lambda: 1.0,
            mu_l,
            sig_l,
            speed: 0.0,
            v0: 1.0,
            eta_v: 0.0,
            rho: 0.0,
        };
        let mut strikes: VecDeque<f64> = VecDeque::new();
        strikes.push_back(35.0);
        let num_u: usize = 256;
        let t = 0.5;
        let rate = 0.1;
        let asset = 38.0;
        let integer_that_is_not_an_option = -1;
        let results = get_option_results_as_json(
            integer_that_is_not_an_option,
            false,
            &constraints::CFParameters::Merton(parameters),
            10.0,
            num_u,
            asset,
            t,
            rate,
            strikes,
        );
        assert!(results.is_err());
        assert_eq!(
            results.unwrap_err().to_string(),
            "Function indicator -1 does not exist."
        );
    }
}
