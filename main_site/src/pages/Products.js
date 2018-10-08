import React from 'react'
import {
    Row, Col, Container, Jumbotron
} from 'reactstrap'


export default ()=>(
    <Jumbotron 
        fluid 
        className='white-background'
    >
        <Container>
            <Row>
                <Col xs={12} sm={12} lg={6}>
                    <h1 className="display-3">RealOptions</h1>
                    <p >Our flagship product!  Computes call and put prices, Black Scholes implied volatilities, and risk metrics like value at risk for three cutting edge models: the Heston model, the extended Merton jump-diffusion model, and the extended CGMY model.</p>

                    <h3 >How it works</h3>
                    <p>We provide REST API endpoints for each model.  Simply pick the model you want and the option prices will be returned!</p>
                    <h3>What it costs</h3>
                    <p>Only pay for what you use!  Each endpoint call is only 10 cents.</p>
                    <h3 >Open and tested!</h3>
                    <p>We extensively test our products for accuracy.  All our code is open source so you can review the code yourself!  </p>
                    <h3>Model documentation</h3>
                    <p>No option models are complete without documentation!  We provide comprehensive <a 
                        href={`${process.env.PUBLIC_URL}/OptionCalculation.pdf`}
                    target='_blank'
                    rel="noopener noreferrer"
                    >documentation</a> for the model theory and assumptions.</p>
                </Col> 
            </Row>
        </Container>
    </Jumbotron>
)