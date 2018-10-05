import React from 'react'
import {
     Row, Col, Container
} from 'reactstrap'
import { connect } from 'react-redux'
import Loading from '../components/Loading'
import AsyncLoad from '../components/AsyncLoad'
import ApiCard from '../components/ApiCard'
import {
    getCatalog
} from '../services/api-catalog'


const padding={paddingTop:20}

export const Developers=({
    catalog, getCatalog, 
    match
})=>(
    <Container>
        <Row>
            <AsyncLoad 
                requiredObject={catalog.length>0} 
                onLoad={getCatalog} 
                loading={Loading} 
                render={()=>catalog
                    .map(({id:usagePlanId, name, apis})=>apis
                    .map(({id:apiId})=>(
                    <Col xs={12} md={6} lg={4} key={apiId} style={padding}>
                        <ApiCard url={match.url} usagePlanId={usagePlanId} name={name}/>
                    </Col>
            )))}/>
        </Row>
    </Container>
)
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