import React from 'react'
import {
     Row, Col, Container
} from 'reactstrap'
import Swagger from './Swagger'
import ApiModal from '../components/ApiModal'

const paddingTop={paddingTop:20}

export default ()=>[
    <Container key='container'>           
        <Row>
            <Col style={paddingTop}>
                <ApiModal/>
            </Col>
        </Row>
    </Container>,
    <Swagger key='swagger'/>
]
