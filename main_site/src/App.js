import React from 'react'
import { Layout } from 'antd'
import Swagger from './Swagger'
import './App.css'
import 'antd/dist/antd.css'
import { HashRouter as Router, Route, Link } from 'react-router-dom'

const { Content, Footer } = Layout
const standardLight = '#fff'
const standardDark = '#001529'
const divDark = { background: standardDark, height: '100vh' }
const divLight = { background: standardLight, height: '100vh' }
const standardPadding = { padding: 100 }
const App = () => (
  <Router>
    <div>
      <Route
        exact
        path="/"
        render={() => (
          <Layout>
            <Content>
              <div style={divDark} id="home">
                <h1 style={{ color: standardLight, ...standardPadding }}>
                  Derivatives Modeling as a Service
                </h1>
                <p style={{ color: standardLight, ...standardPadding }}>
                  For decades, the same financial models have been programmed
                  and re-programmed at every bank. We are changing that.
                  Combining state-of-the-art modeling with modern REST APIs, our
                  models as a service provides robust, scalable infrastructure
                  at a bargain price.
                </p>
              </div>
              <div style={{ ...standardPadding, ...divLight }} id="features">
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
              </div>
              <div style={divDark} id="pricing">
                Pricing
              </div>
              <div style={divLight} id="about">
                About
                <Link to="/api_docs">Api Docs</Link>
              </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>optsaas</Footer>
          </Layout>
        )}
      />
      <Route path="/api_docs" component={Swagger} />
    </div>
  </Router>
)

export default App
