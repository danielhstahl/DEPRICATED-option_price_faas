#[macro_use]
extern crate serde_json;
extern crate constraints;
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let fn_choice:i32=args[1].parse().unwrap();
    let constraints=match fn_choice{
        constraints::CGMY=>{
            json!(
                constraints::get_cgmy_constraints()
            )
             
        },
        constraints::MERTON=>{
            json!(
                constraints::get_merton_constraints()
            )
        },
        constraints::HESTON=>{
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