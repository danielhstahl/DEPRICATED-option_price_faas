const toOpenApi = require('json-schema-to-openapi-schema')
const fs=require('fs')
const names=[
    {
        from:'GetConstraintsResponse_schema.json',
        to:'GetConstraintsResponse.json'
    },
    {
        from:'PostDensityResponse_schema.json',
        to:'PostDensityResponse.json'
    },
    {
        from:'PostOptionsRequest_schema.json',
        to:'PostOptionsRequest.json'
    },
    {
        from:'PostOptionsResponse_schema.json',
        to:'PostOptionsResponse.json'
    },
    {
        from:'PostRiskMetricResponse_schema.json',
        to:'PostRiskMetricResponse.json'
    }
]
names.forEach(({from, to})=>{
    fs.readFile(`./models/${from}`, (err, data)=>{
        if(err) return console.log(err)
        const schema=JSON.parse(data)
        const openApiSchema=toOpenApi(schema)
        fs.writeFile(`./models/${to}`, JSON.stringify(openApiSchema), err=>{
            if(err) console.log(err)
        })
    })
}) 

