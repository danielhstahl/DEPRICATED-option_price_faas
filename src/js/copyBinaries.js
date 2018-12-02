const fs=require('fs-extra')
const admZip=require('adm-zip')
const zip=new admZip()
const origBinaryLocation='./target/x86_64-unknown-linux-musl/release'
const newZipLocation='./'
const locationNames=[
    'constraints',
    'pricer',
    'riskmetric',
    'density'
]
module.exports=()=>locationNames.forEach(name=>{
    fs.ensureDir(`${newZipLocation}/${name}`).then(()=>{
        return fs.copy(
            `${origBinaryLocation}/${name}`,
            `${newZipLocation}/${name}/bootstrap`
        )
    }).then(()=>{
        zip.addLocalFile(`${newZipLocation}/${name}/bootstrap`)
        zip.writeZip(`${newZipLocation}/${name}.zip`)
    }).then(()=>{
        return fs.remove(`${newZipLocation}/${name}`)
    })
})