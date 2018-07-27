const {exec}=require('child_process')
exec('git commit -m "release v1"', (err, stdout, stderr)=>{
    if(err||stderr){
        console.log(err)
        console.log(stderr)
    }
    else{
        console.log(stdout)
    }
})