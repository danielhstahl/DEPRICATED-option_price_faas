#[macro_use]
extern crate criterion;
use criterion::{Criterion, ParameterizedBenchmark};
extern crate num_complex;
extern crate utils;
use std::collections::VecDeque;
use utils::constraints;
use utils::maps;
fn bench_option_price_u(c: &mut Criterion) {
    c.bench("option prices varying u",
        ParameterizedBenchmark::new("merton", |b, num_u|{
            b.iter(|| {
                let mut strikes: VecDeque<f64> = VecDeque::new();
                strikes.push_back(50.0);
                //let num_u: usize = 256;
                let t = 1.0;
                let rate = 0.03;
                let asset = 50.0;
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

                maps::get_option_results_as_json(
                    maps::CALL_PRICE,
                    false,
                    &constraints::CFParameters::Merton(parameters),
                    10.0,
                    *num_u,
                    asset,
                    t,
                    rate,
                    strikes,
                )
                .unwrap();
            });
        }, vec![128, 256, 512, 1024]).with_function("cgmy", |b, num_u|{
            b.iter(|| {
                let mut strikes: VecDeque<f64> = VecDeque::new();
                strikes.push_back(50.0);
                let t = 1.0;
                let rate = 0.03;
                let asset = 50.0;
                let parameters = crate::constraints::CGMYParameters {
                    sigma: 0.2,
                    c: 1.0,
                    g: 5.0,
                    m: 5.0,
                    y: 0.5,
                    speed: 0.1,
                    v0: 1.0,
                    eta_v: 0.2,
                    rho: -0.1,
                };
                maps::get_option_results_as_json(
                    maps::CALL_PRICE,
                    true,
                    &crate::constraints::CFParameters::CGMY(parameters),
                    10.0,
                    *num_u,
                    asset,
                    t,
                    rate,
                    strikes,
                )
                .unwrap();
            });
        }).with_function("heston", |b, num_u|{
            b.iter(|| {
                let mut strikes: VecDeque<f64> = VecDeque::new();
                strikes.push_back(50.0);
                let t = 1.0;
                let rate = 0.03;
                let asset = 50.0;
                let parameters = crate::constraints::HestonParameters {
                    sigma: 0.2,
                    speed: 0.3,
                    v0:0.2,
                    eta_v: 0.2,
                    rho:-0.5,
                };
                maps::get_option_results_as_json(
                    maps::CALL_PRICE,
                    true,
                    &crate::constraints::CFParameters::Heston(parameters),
                    10.0,
                    *num_u,
                    asset,
                    t,
                    rate,
                    strikes,
                )
                .unwrap();
            });
        })
    );
}
#[derive(Debug)]
enum StrikeScenario{
    OneStrike,
    SevenStrike,
    SixtyStrike
}
fn switch_strikes(scenario: &StrikeScenario)->VecDeque<f64>{
    match scenario{
        StrikeScenario::OneStrike=>{
            let mut strikes: VecDeque<f64> = VecDeque::new();
            strikes.push_back(50.0);
            strikes
        },
        StrikeScenario::SevenStrike=>{
            let mut strikes: VecDeque<f64> = VecDeque::new();
            strikes.push_back(20.0);
            strikes.push_back(30.0);
            strikes.push_back(40.0);
            strikes.push_back(50.0);
            strikes.push_back(60.0);
            strikes.push_back(70.0);
            strikes.push_back(80.0);
            strikes
        },
        StrikeScenario::SixtyStrike=>{
            let mut strikes: VecDeque<f64> = VecDeque::new();
            for i in 20..80{
                strikes.push_back(i as f64);
            }
            strikes
        }
    }
}
fn bench_option_price_strike(c: &mut Criterion) {
    c.bench("option prices varying strike",
        ParameterizedBenchmark::new(
            "merton",
            |b, scenario|{
                b.iter(|| {
                    let strikes=switch_strikes(&scenario);
                    let num_u: usize = 256;
                    let t = 1.0;
                    let rate = 0.03;
                    let asset = 50.0;
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

                    maps::get_option_results_as_json(
                        maps::CALL_PRICE,
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
                });
            },
            vec![StrikeScenario::OneStrike, StrikeScenario::SevenStrike, StrikeScenario::SixtyStrike]
        ).with_function("cgmy", |b, scenario|{
            b.iter(|| {
                let strikes=switch_strikes(&scenario);
                let num_u: usize = 256;
                let t = 1.0;
                let rate = 0.03;
                let asset = 50.0;
                let parameters = crate::constraints::CGMYParameters {
                    sigma: 0.2,
                    c: 1.0,
                    g: 5.0,
                    m: 5.0,
                    y: 0.5,
                    speed: 0.1,
                    v0: 1.0,
                    eta_v: 0.2,
                    rho: -0.1,
                };
                maps::get_option_results_as_json(
                    maps::CALL_PRICE,
                    true,
                    &crate::constraints::CFParameters::CGMY(parameters),
                    10.0,
                    num_u,
                    asset,
                    t,
                    rate,
                    strikes,
                )
                .unwrap();
            });
        }).with_function("heston", |b, scenario|{
            b.iter(|| {
                let strikes=switch_strikes(&scenario);
                let num_u: usize = 256;
                let t = 1.0;
                let rate = 0.03;
                let asset = 50.0;
                let parameters = crate::constraints::HestonParameters {
                    sigma: 0.2,
                    speed: 0.3,
                    v0:0.2,
                    eta_v: 0.2,
                    rho:-0.5,
                };
                maps::get_option_results_as_json(
                    maps::CALL_PRICE,
                    true,
                    &crate::constraints::CFParameters::Heston(parameters),
                    10.0,
                    num_u,
                    asset,
                    t,
                    rate,
                    strikes,
                )
                .unwrap();
            });
        })
    );
}
criterion_group!(benches, bench_option_price_u, bench_option_price_strike);
criterion_main!(benches);