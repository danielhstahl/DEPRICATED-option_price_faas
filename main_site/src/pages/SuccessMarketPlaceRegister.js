import React from 'react'
import {Row, Col, Container} from 'reactstrap'
import {Link} from 'react-router-dom'
import {
    DEVELOPERS, SUBSCRIPTIONS
} from '../routes/names'
const padding={paddingTop:20}
export default ()=>(
    <Container>
        <Row >
            <Col xs={12} style={padding}>
                <h3>Successfully logged in to marketplace!</h3>
                <p>Got to the <Link to={DEVELOPERS}>developer portal</Link> to test the connections or manage <Link to={SUBSCRIPTIONS}>subscriptions</Link>.</p>
            </Col>
        </Row>
    </Container>
)