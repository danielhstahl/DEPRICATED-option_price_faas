import React from 'react'
import {Row, Col, Container} from 'reactstrap'
import SignIn from '../components/SignIn'
//import RedirectToHomeIfLoggedIn from '../components/RedirectToHomeIfLoggedIn'

const padding={paddingTop:20}

export default ({history})=>(
    <Container>
        <Row >
            <Col xs={12} md={6} lg={4} style={padding}>
                <SignIn history={history}/>
            </Col>
        </Row>
    </Container>
)