const fs=require('fs-extra')
const admZip=require('adm-zip')
const zip=new admZip()
const {exec}=require('child_process')
const origBinaryLocation='./target/x86_64-unknown-linux-musl/release'
const newZipLocation='.'
const locationNames=[
    'constraints',
    'pricer',
    'riskmetric',
    'density'
]
module.exports=()=>locationNames.forEach(name=>{
    fs.ensureDir(`${newZipLocation}/${name}`)
    .then(()=>{
        return new Promise((res, rej)=>{
            exec(`cp -a ${origBinaryLocation}/${name} ${newZipLocation}/${name}/bootstrap`, (err, stdout, stderr)=>{
                const error=err||stderr
                if(error){
                    return rej(error)
                }
                return res(stdout)
            })
        })
    })
    .then(()=>{
        zip.addLocalFile(`${newZipLocation}/${name}/bootstrap`)
        zip.writeZip(`${newZipLocation}/${name}.zip`)
    })
    .then(()=>{
        return fs.remove(`${newZipLocation}/${name}`)
    })
})