const calibratorKeys={
    cgmy:0,
    merton:1,
    heston:2,
    cgmy_diffusion:3,
    merton_diffusion:4,
    cgmy_stochastic_vol:5,
    merton_stochastic_vol:6,
    cgmy_leverage:7,
    merton_leverage:8
}

const calculatorKeys={
    putprice:0,
    callprice:1,
    putdelta:2,
    calldelta:3,
    putgamma:4,
    callgamma:5,
    puttheta:6,
    calltheta:7,
    density:8,
    riskmetric:9
}

module.exports={
    calibratorKeys,
    calculatorKeys
}