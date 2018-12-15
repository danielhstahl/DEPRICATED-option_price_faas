const {exec}=require('child_process')
const origBinaryLocation='./target/x86_64-unknown-linux-musl/release'
const newZipLocation='.'
const locationNames=[
    'constraints',
    'pricer',
    'riskmetric',
    'density'
]
locationNames.reduce((p, name)=>p.then(()=>{
    return new Promise((res, rej)=>{
        exec(`cp ${origBinaryLocation}/${name} ./bootstrap && zip ${newZipLocation}/${name}.zip bootstrap && rm bootstrap`, (err, stdout, stderr)=>{
            const error=err||stderr
            if(error){
                console.log(error)
                return rej(error)
            }
            return res(stdout)
        })
    })
}), Promise.resolve())