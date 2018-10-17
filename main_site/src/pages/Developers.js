import React from 'react'
import {
     Row, Col, Container,
     Collapse, Button,
} from 'reactstrap'
import Swagger from './Swagger'
import {
    DEVELOPERS,
    NODOCS,
    DOCS
} from '../routes/names'
import {
    SHOW_SWAGGER
} from '../routes/params'
import ApiModal from '../components/ApiModal'
import { Link } from 'react-router-dom'

const paddingTop={paddingTop:20}
const paddingRight={paddingRight:20}

const matchDocs=showswagger=>'/'+showswagger===NODOCS
const linkToOther=showswagger=>matchDocs(showswagger)?DOCS:NODOCS
export default ({
    match
})=>[
    <Container key='container'>           
        <Row>
            <Col style={paddingTop}>
                <Link 
                    to={DEVELOPERS+linkToOther(match.params[SHOW_SWAGGER])}
                    style={paddingRight}
                ><Button color='primary'>Api Docs</Button></Link>
                <ApiModal/>
            </Col>
            
        </Row>
    </Container>,
    <Collapse key='collapse' isOpen={!matchDocs(match.params[SHOW_SWAGGER])}>
        <Swagger/>
    </Collapse>
]
