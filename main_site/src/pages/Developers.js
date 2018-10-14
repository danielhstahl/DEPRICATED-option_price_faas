import React from 'react'
import {
     Row, Col, Container,
     Collapse, Button,
} from 'reactstrap'
import { connect } from 'react-redux'
import Loading from '../components/Loading'
import AsyncLoad from '../components/AsyncLoad'
import ApiCard from '../components/ApiCard'
import Swagger from './Swagger'
import {
    getCatalog
} from '../services/api-catalog'
import {
    DEVELOPERS,
    NODOCS,
    DOCS
} from '../routes/names'
import ApiModal from '../components/ApiModal'
import { Link } from 'react-router-dom'

const paddingTop={paddingTop:20}
const paddingRight={paddingRight:20}

const matchDocs=showswagger=>'/'+showswagger===NODOCS
const linkToOther=showswagger=>matchDocs(showswagger)?DOCS:NODOCS
export const Developers=({
    catalog, getCatalog, 
    match
})=>{
    console.log(catalog)
    return [
    <Container key='container'>
        <Row>
            <AsyncLoad 
                requiredObject={catalog.length>0} 
                onLoad={getCatalog} 
                loading={Loading} 
                render={
                    ()=>catalog
                        .map(({
                                id:usagePlanId, 
                                name, apiStages,
                                description,
                                quota
                            })=>(
                        <Col xs={12} md={6} lg={4} key={usagePlanId} style={paddingTop}>
                            <ApiCard 
                                name={name}
                                description={description}
                                stages={apiStages}
                                quota={quota}
                            />
                        </Col>
                ))}/>
        </Row>
        <Row>
            <Col style={paddingTop}>
                <Link 
                    to={DEVELOPERS+linkToOther(match.params.showswagger)}
                    style={paddingRight}
                ><Button color='primary'>Api Docs</Button></Link>
                <ApiModal/>
            </Col>
            
        </Row>
    </Container>,
    <Collapse key='collapse' isOpen={!matchDocs(match.params.showswagger)}>
        <Swagger/>
    </Collapse>
]}
const mapStateToProps=({catalog})=>({
    catalog
})

const mapDispatchToProps=dispatch=>({
    getCatalog:getCatalog(dispatch)
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Developers)