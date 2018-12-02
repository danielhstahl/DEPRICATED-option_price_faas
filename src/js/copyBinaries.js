const fs=require('fs-extra')
const origBinaryLocation='./target/x86_64-unknown-linux-musl/release'
const newBinaryLocation='./target/lambda'
const locationNames=[
    'constraints',
    'pricer',
    'riskmetric',
    'density'
]
module.exports=()=>fs.ensureDir(newBinaryLocation)
    .then(()=>Promise.all(
        locationNames.map(name=>fs.ensureDir(`${newBinaryLocation}/${name}`))
    ))
    .then(()=>Promise.all(
        locationNames.map(name=>fs.copy(
            `${origBinaryLocation}/${name}`, 
            `${newBinaryLocation}/${name}/bootstrap`
        ))
    ))