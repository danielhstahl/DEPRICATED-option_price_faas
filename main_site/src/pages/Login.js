import React from 'react'
import {Container, Row, Col} from 'reactstrap'
import SignIn from '../components/SignIn'
import RedirectToHomeIfLoggedIn from '../components/RedirectToHomeIfLoggedIn'

const padding={paddingTop:20}

export default ({history})=>(
    <RedirectToHomeIfLoggedIn>
        <Container>
            <Row >
                <Col xs={12} md={6} lg={4} style={padding}>
                    <SignIn history={history}/>
                </Col>
            </Row>
        </Container>
    </RedirectToHomeIfLoggedIn>
)