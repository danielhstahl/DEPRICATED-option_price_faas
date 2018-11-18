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
#[cfg(test)]
extern crate rand;
#[cfg(test)]
use rand::{SeedableRng, StdRng};
#[cfg(test)]
use rand::distributions::Uniform;
#[cfg(test)]
use rand::distributions::{Distribution};
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



#[cfg(test)]
mod tests {
    use super::*;
    fn get_rng_seed(seed:[u8; 32])->StdRng{
        SeedableRng::from_seed(seed) 
    }
    fn get_over_region(lower:f64, upper:f64, rand:f64)->f64{
        lower+(upper-lower)*rand
    }
    #[test]
    fn test_many_inputs(){
        let seed:[u8; 32]=[2; 32];
        let mut rng_seed=get_rng_seed(seed);
        let uniform=Uniform::new(0.0f64, 1.0);
        let constr=constraints::get_merton_constraints();
        let asset=178.46;
        let num_u=256;
        let strikes=vec![
            95.0,130.0,150.0,160.0,
            165.0,170.0,175.0,185.0,
            190.0,195.0,200.0,210.0,240.0,250.0
        ];
        let maturity=0.86;
        let rate=0.02;
        let num_total:usize=10000;
        let mut num_bad:usize=0;
        (0..num_total).for_each(|_|{
            let lambda_sim=get_over_region(
                constr["lambda"].lower,
                constr["lambda"].upper,
                uniform.sample(&mut rng_seed)
            );
            let mu_l_sim=get_over_region(
                constr["mu_l"].lower,
                constr["mu_l"].upper,
                uniform.sample(&mut rng_seed)
            );
            let sig_l_sim=get_over_region(
                constr["sig_l"].lower,
                constr["sig_l"].upper,
                uniform.sample(&mut rng_seed)
            );
            let sigma_sim=get_over_region(
                constr["sigma"].lower,
                constr["sigma"].upper,
                uniform.sample(&mut rng_seed)
            );
            let v0_sim=get_over_region(
                constr["v0"].lower,
                constr["v0"].upper,
                uniform.sample(&mut rng_seed)
            );
            let speed_sim=get_over_region(
                constr["speed"].lower,
                constr["speed"].upper,
                uniform.sample(&mut rng_seed)
            );
            let eta_v_sim=get_over_region(
                constr["eta_v"].lower,
                constr["eta_v"].upper,
                uniform.sample(&mut rng_seed)
            );
            let rho_sim=get_over_region(
                constr["rho"].lower,
                constr["rho"].upper,
                uniform.sample(&mut rng_seed)
            );

            let inst_cf=cf_functions::merton_time_change_cf(
                maturity, rate, lambda_sim, 
                mu_l_sim, sig_l_sim, 
                sigma_sim, v0_sim,
                speed_sim, eta_v_sim, rho_sim
            );
            let opt_prices=option_pricing::fang_oost_call_price(
                num_u, asset, 
                &strikes, rate, 
                maturity, &inst_cf
            );
            
            for option_price in opt_prices.iter(){
                if option_price.is_nan()||option_price.is_infinite(){
                    println!("lambda: {}", lambda_sim);
                    println!("mu_l: {}", mu_l_sim);
                    println!("sig_l: {}", sig_l_sim);
                    println!("sigma: {}", sigma_sim);
                    println!("v0: {}", v0_sim);
                    println!("speed: {}", speed_sim);
                    println!("eta_v: {}", eta_v_sim);
                    println!("rho: {}", rho_sim);
                    num_bad=num_bad+1;
                    break;
                }
                //assert_eq!(!option_price.is_nan());
            }
        });
        let bad_rate=(num_bad as f64)/(num_total as f64);
        println!("Bad rate: {}", bad_rate);
        assert_eq!(bad_rate, 0.0);
    }
   #[test]
    fn replicate_error(){
        let asset=223.4000;
        let rate=0.0247;
        let maturity=0.7599;
        let eta_v=1.3689;
        let lambda=0.0327;
        let mu_l=-0.3571;
        let rho=-0.0936;
        let sig_l=0.5876;
        let sigma=0.2072;
        let speed=0.87;
        let v0=1.2104;
        
        let x_max=cf_functions::jump_diffusion_vol(
            sigma, lambda,
            mu_l, sig_l, 
            maturity
        )*10.0;
        let strikes=vec![
            asset*(x_max.exp()),
            85.0,90.0,100.0,110.0,120.0,125.0,130.0,135.0,140.0,
            145.0,150.0,155.0,160.0,165.0,170.0,175.0,180.0,
            185.0,190.0,195.0,200.0,205.0,210.0,215.0,220.0,
            225.0,230.0,235.0,240.0,245.0,250.0,255.0,260.0,
            265.0,270.0,275.0,280.0,285.0,290.0,295.0,300.0,
            310.0,320.0,330.0,340.0,
            asset*((-x_max).exp())
        ];
        let inst_cf=cf_functions::merton_time_change_cf(
            maturity, rate, lambda, mu_l, sig_l, sigma, v0,
            speed, eta_v, rho
        );
        let num_u=256;
        let prices=option_pricing::fang_oost_call_price(
            num_u, asset, 
            &strikes, rate, 
            maturity, &inst_cf
        );
        print_call_prices(
            &strikes, &prices,
            asset, rate, maturity
        );
    }

}