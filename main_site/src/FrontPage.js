import React from 'react'
import {  Row, Col } from 'antd'
import './App.css'
import { Link } from 'react-router-dom'
import './styles/frontPage.less'
import {xs, md, lg} from './styles/spanStyles'

//const standardLight = '#fff'
//const standardDark = '#001529'
const heightStyle = { height: '100vh' }
const padding={paddingTop:20}
//const divLight = { background: standardLight, height: '100vh' }
//const hLight={ color: standardLight }

export default ()=>[
    <Row style={heightStyle} className='row-primary' gutter={16} key='summary' >
        <Col xs={xs} md={md} lg={lg} style={padding}>
        
            <h1 className='light-color'>
                Derivatives Modeling as a Service
            </h1>
            <p className='light-color'>
                For decades, the same financial models have been programmed
                and re-programmed at every bank. We are changing that.
                Combining state-of-the-art modeling with modern REST APIs, our
                models as a service provides robust, scalable infrastructure
                at a bargain price.
            </p>
        
        </Col>
    </Row>,
    <Row style={heightStyle} className='row-secondary'  gutter={16} key='description'>
        <Col xs={xs} md={md} lg={lg}  style={padding}>
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
            For more information on the models, see the <a href='/OptionCalculation.pdf'>documentation</a>.
            </p>
        </Col>
    </Row>,
    <Row style={heightStyle} gutter={16} className='row-primary light-color' key='pricing'>
        <Col xs={xs} md={md} lg={lg}  style={padding}>
            Pricing
        </Col>
    </Row>,
    <Row style={heightStyle} gutter={16} className='row-secondary' key='about'>
        <Col  xs={xs} md={md} lg={lg}  style={padding}>
            About: <Link to="/api_docs">Api Docs</Link>
        </Col>
    </Row>
]