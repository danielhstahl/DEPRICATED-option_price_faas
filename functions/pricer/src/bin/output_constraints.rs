#[macro_use]
extern crate serde_json;
extern crate constraints;

fn main(){
    let constraints=json!(
        constraints::get_constraints()
    );
    println!("{}", serde_json::to_string_pretty(&constraints).unwrap())
}