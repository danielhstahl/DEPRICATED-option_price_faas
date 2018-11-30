const resolve = require('json-refs').resolveRefs
const YAML = require('js-yaml')
const fs = require('fs')

const root = YAML.load(fs.readFileSync('./docs/openapi.yml').toString());
const options = {
    processContent:  (content)=>{
        return YAML.load(content)
    },
    filter: ['relative'],
    location:'./docs/openapi.yml'
}
module.exports=()=>resolve(root, options).then( (results)=>{
    fs.writeFileSync(
        './docs/openapi_merged.yml', 
        YAML.dump(results.resolved)
    )
})