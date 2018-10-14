const { exec } = require('child_process')
const {writeFile} = require('fs') 
const stackName=process.argv[2]
exec(
    `aws cloudformation describe-stacks --stack-name "${stackName}"`, 
    (err, stdout, stderr)=>{
        const error=err||stderr
        if(error){
            return console.log(error)
        }
        const result=JSON.parse(stdout).Stacks.find(({StackName})=>StackName===stackName)
        const envStr=result.Outputs.reduce((aggr, {OutputKey, OutputValue})=>[...aggr, 'REACT_'+OutputKey+':'+OutputValue], []).join('\n')
        writeFile('./.env', envStr, err=>{
            if(err){
                console.log(err)
            }
        })
    }
)