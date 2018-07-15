extern crate fang_oost_option;

#[macro_use]
extern crate serde_json;
#[macro_use]
extern crate serde_derive;

use serde_json::{to_value, Value, Error};
use fang_oost_option::option_pricing::*;
use std::env;
use std::collections::VecDeque;
use std::io;

const put_price:i32=0;
const call_price:i32=1;

const put_delta:i32=2;
const call_delta:i32=3;

const put_gamma:i32=4;
const call_gamma:i32=5;

const put_theta:i32=6;
const call_theta:i32=7;

const density:i32=8;
const risk_measures:i32=9;

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
    numU:usize
}

impl OptionParameters{
    fn extend_k(&mut self, x_max:f64){
        self.k.push_front((-x_max).exp()*self.S0);
        self.k.push_back(x_max.exp()*self.S0);
    }
}

fn main()-> Result<(), io::Error> {
    let args: Vec<String> = env::args().collect();
    println!("{}", args[1]);
    println!("{}", args[2]);
    let fn_choice:i32=args[1].parse().unwrap();
    let mut parameters:OptionParameters=serde_json::from_str(&args[2])?;
    parameters.extend_k(5.0);
    println!("this is sigma: {}", parameters.sigma);
    println!("this is min k: {}", parameters.k.front().unwrap());
    println!("this is max k: {}", parameters.k.back().unwrap());
    Ok(())
}
