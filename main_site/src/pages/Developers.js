import React from 'react'
import {
     Row, Col, Container
} from 'reactstrap'
import Swagger from '../components/Swagger'
import ApiModal from '../components/ApiModal'

const paddingTop={paddingTop:20}
const style={float:'left'}
export default ()=>[
    <Container key='container'>           
        <Row>
            <Col style={paddingTop}>
                <ApiModal style={style}/>
            </Col>
        </Row>
    </Container>,
    <Swagger key='swagger'/>
]
