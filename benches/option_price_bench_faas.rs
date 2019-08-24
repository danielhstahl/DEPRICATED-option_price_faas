#[macro_use]
extern crate criterion;
use criterion::Criterion;
extern crate num_complex;
extern crate utils;
use std::collections::VecDeque;
use utils::constraints;
use utils::maps;
fn bench_option_price(c: &mut Criterion) {
    c.bench_function("option prices", |b|{
        b.iter(|| {
            let mut strikes: VecDeque<f64> = VecDeque::new();
            strikes.push_back(50.0);
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
    });
}
criterion_group!(benches, bench_option_price);
criterion_main!(benches);