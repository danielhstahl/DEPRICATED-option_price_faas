const yamlWrite=require('./src/js/writeYml')

yamlWrite().catch(err=>{
    console.log(err)
})