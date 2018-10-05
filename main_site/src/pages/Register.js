import React from 'react'
import {Row, Col, Container} from 'reactstrap'
import SignIn from '../components/SignIn'
import RedirectToHomeIfLoggedIn from '../components/RedirectToHomeIfLoggedIn'

const padding={paddingTop:20}

export default ({history})=>(
    <RedirectToHomeIfLoggedIn>
        <Container>
            <Row >
                <Col xs={12} md={6} lg={4} style={padding}>
                    <SignIn isRegistration history={history}/>
                </Col>
            </Row>
        </Container>
    </RedirectToHomeIfLoggedIn>
)