import React from 'react'
import {  Row, Col } from 'antd'
import SignIn from '../components/SignIn'
import RedirectToHomeIfLoggedIn from '../components/RedirectToHomeIfLoggedIn'

const padding={paddingTop:20}

export default ({history})=>(
    <RedirectToHomeIfLoggedIn>
        <Row gutter={16} key='apirow' type="flex" justify="space-around" >
            <Col xs={24} md={12} lg={8} style={padding}>
                <SignIn isRegistration history={history}/>
            </Col>
        </Row>
    </RedirectToHomeIfLoggedIn>
)