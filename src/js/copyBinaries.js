const fs=require('fs-extra')
const origBinaryLocation='./target/x86_64-unknown-linux-musl/release'
const newBinaryLocation='./target/lambda'

module.exports=()=>Promise.all([
    fs.copy(
        `${origBinaryLocation}/output_constraints`, 
        `${newBinaryLocation}/constraints/bootstrap`
    ),
    fs.copy(
        `${origBinaryLocation}/pricer`, 
        `${newBinaryLocation}/pricer/bootstrap`
    ),
    fs.copy(
        `${origBinaryLocation}/riskmetric`, 
        `${newBinaryLocation}/riskmetric/bootstrap`
    ),
    fs.copy(
        `${origBinaryLocation}/density`, 
        `${newBinaryLocation}/density/bootstrap`
    )
])