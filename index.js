const binaryCopy=require('./src/js/copyBinaries')
const yamlWrite=require('./src/js/writeYml')

Promise.all([
    binaryCopy(),
    yamlWrite()
]).then(([resb, resy])=>{
    console.log(resb)
    console.log(resy)
}).catch(err=>{
    console.log(err)
})