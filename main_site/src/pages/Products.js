import React from 'react'
import {
    Container, Row, Col
} from 'reactstrap'
import Pricing from '../components/Pricing'
import {Link} from 'react-router-dom'
const padding={paddingTop:40, paddingBottom:20}
const mainSm={offset:3, size:6}
export default ()=>(
<Container>
    <Row key='description'>
        <Col xs={12} sm={mainSm} style={padding}>
            <h1 className='text-center'>Real Options</h1>
            <p>Our flagship product!  Computes call and put prices, Black Scholes implied volatilities, value at risk, densities, and expected shortfall for three cutting edge models.</p>
        </Col>
    </Row>
    <Row>
        <Col xs={12} sm={6}>
            <h3>Cutting edge models</h3>
            <p>Heston, Extended Merton Jump-Diffusion, and Extended CGMY!  Each model includes a diffusion component which is correlated with a stochastic clock.  Incorporates skew, excess kurtosis, and stochastic volatility!</p>
        </Col>
        <Col xs={12} sm={6}>
            <h3>Easy to use</h3>
            <p><Link to='/register'>Obtain an API key</Link> and start making API calls!</p>
        </Col>
    </Row>
    <Row>
        <Col xs={12} sm={6}>
            <h3>Open and tested</h3>
            <p>We extensively test our products for accuracy.  <a href='https://github.com/phillyfan1138'
            target='_blank'
            rel="noopener noreferrer">All our code is open source</a> so you can review the code yourself!</p>
        </Col>
        <Col xs={12} sm={6}>
            <h3>Documented</h3>
            <p>No option models are complete without documentation!  We provide comprehensive <a 
            href={`${process.env.PUBLIC_URL}/OptionCalculation.pdf`}
            target='_blank'
            rel="noopener noreferrer"
            >documentation</a> for the model theory and assumptions.</p>
        </Col>
    </Row>
    <Pricing/>
</Container>
)