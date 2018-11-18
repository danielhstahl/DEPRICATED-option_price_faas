#[macro_use]
extern crate serde_json;
extern crate utils;
use utils::constraints;
use utils::maps;
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let fn_choice:i32=args[1].parse().unwrap();
    let constraints=match fn_choice{
        maps::CGMY=>{
            json!(
                constraints::get_cgmy_constraints()
            )
        },
        maps::MERTON=>{
            json!(
                constraints::get_merton_constraints()
            )
        },
        maps::HESTON=>{
            json!(
                constraints::get_heston_constraints()
            )
        },
        _=>{
            json!(
                constraints::get_constraints()
            )
        }
    };
    println!("{}", &constraints)
}