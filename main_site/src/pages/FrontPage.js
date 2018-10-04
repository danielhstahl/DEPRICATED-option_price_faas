import React from 'react'
import { Jumbotron, Button, Row, Col, Container } from 'reactstrap'
import { Link } from 'react-router-dom'
import '../styles/frontPage.css'
import {xs, md, lg} from '../styles/spanStyles'

const heightStyle = { height: '100vh' }
const backgroundColor={background:'#030852'}
const whiteText={color:'#fff'}
const padding={paddingTop:20}

export default ()=>[
    <Jumbotron style={{...heightStyle, ...backgroundColor, ...whiteText}} key='summary' fluid className='row-primary'>
        <Container >
            <h1 className="display-3">
                Derivatives Modeling as a Service
            </h1>
            <p className="lead">
                For decades, the same financial models have been programmed
                and re-programmed at every bank. We are changing that.
                Combining state-of-the-art modeling with modern REST APIs, our
                models as a service provides robust, scalable infrastructure
                at a bargain price.
            </p>
        </Container>
    </Jumbotron>,
    <Jumbotron style={heightStyle} key='description' fluid>
        <Container>
            <h1 className="display-3">Option Pricing Models</h1>
            <p className="lead">
                Our models are the most sophisticated in the industry. Our
                software engineering is top notch.  
            </p>
            <ul className="lead">
                <li>Robust Black-Scholes implied volatility</li>
                <li>
                    Option Pricing under extended Merton, Heston, and CGMY
                </li>
                <li>Greeks</li>
                <li>Value at Risk and Expected Shortfall</li>
            </ul>
            <p className="lead">
            For more information on the models, see the <a 
                href={`${process.env.PUBLIC_URL}/OptionCalculation.pdf`}
                target='_blank'
            >documentation</a>.
            </p>
        </Container>
    </Jumbotron>,
    <Jumbotron style={heightStyle} key='pricing' fluid>
        <h1 className="display-3">Pricing</h1>
        
    </Jumbotron>,
    <Jumbotron style={heightStyle} key='about' fluid>
        <h1 className="display-3">About: <Link to="/api_docs">Api Docs</Link></h1>
    </Jumbotron>
]