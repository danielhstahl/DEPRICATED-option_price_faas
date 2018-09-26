import React from 'react'
import {  Row, Col } from 'antd'
import './App.css'
import 'antd/dist/antd.css'
import { Link } from 'react-router-dom'

const standardLight = '#fff'
const standardDark = '#001529'
const divDark = { background: standardDark, height: '100vh' }
const divLight = { background: standardLight, height: '100vh' }
const hLight={ color: standardLight }
const sm={span:22, offset:1}
const md={span:16, offset:2}
const lg={span:16, offset:3}

export default ()=>[
    <Row style={divDark} gutter={16} key='summary'>
        <Col sm={sm} md={md} lg={lg} style={{paddingTop:10}}>
        
            <h1 style={hLight}>
                Derivatives Modeling as a Service
            </h1>
            <p style={hLight}>
                For decades, the same financial models have been programmed
                and re-programmed at every bank. We are changing that.
                Combining state-of-the-art modeling with modern REST APIs, our
                models as a service provides robust, scalable infrastructure
                at a bargain price.
            </p>
        
        </Col>
    </Row>,
    <Row style={divLight} gutter={16} key='description'>
        <Col sm={sm} md={md} lg={lg}>
            <h1>Option Pricing Models</h1>
            <p>
            Our models are the most sophisticated in the industry. Our
            software engineering is top notch.
            </p>
            <ul>
            <li>Robust Black-Scholes implied volatility</li>
            <li>
                Modern calibration techniques using advanced models which go
                far beyond Heston.
            </li>
            <li>
                Modern calculation techniques including pricing, Greeks,
                option implied density, value at risk, and expected
                shortfall.
            </li>
            </ul>
            <p>
            For more information on the models, see the 
            <a href={`${process.env.PUBLIC_URL}/OptionCalculation.pdf`}>
                summary documentation
            </a>
            and the detailed 
            <a href={`${process.env.PUBLIC_URL}/OptionCalibration.pdf`}>
                calibration documentation
            </a>
            </p>
        </Col>
    </Row>,
    <Row style={divDark} gutter={16} key='pricing'>
        <Col  sm={sm} md={md} lg={lg} style={hLight}>
            Pricing
        </Col>
    </Row>,
    <Row style={divLight} gutter={16} key='about'>
        <Col  sm={sm} md={md} lg={lg}>
            About
            <Link to="/api_docs">Api Docs</Link>
        </Col>
    </Row>
]