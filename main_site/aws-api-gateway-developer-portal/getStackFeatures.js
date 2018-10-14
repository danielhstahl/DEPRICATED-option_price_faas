const { exec } = require('child_process')
const {writeFile} = require('fs') 
const stackName=process.argv[2]
const reactOutput=(key, value)=>'REACT_'+key+':'+value
exec(
    `aws cloudformation describe-stacks --stack-name "${stackName}"`, 
    (err, stdout, stderr)=>{
        const error=err||stderr
        if(error){
            return console.log(error)
        }
        const result=JSON.parse(stdout).Stacks.find(({StackName})=>StackName===stackName)
        const envArr1=result.Outputs.reduce((aggr, {OutputKey, OutputValue})=>[...aggr, reactOutput(OutputKey, OutputValue)], [])
        const envArr2=result.Parameters.reduce((aggr, {ParameterValue, ParameterKey})=>[...aggr, reactOutput(ParameterKey, ParameterValue)], [])
        const envStr=[...envArr1, ...envArr2].join('\n')
        writeFile('./.env', envStr, err=>{
            if(err){
                console.log(err)
            }
        })
    }
)