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
import {
    APIEXTENSION
} from '../routes/names'
import ApiModal from '../components/ApiModal'
import { Link } from 'react-router-dom'
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
                    .map(({
                            id:usagePlanId, 
                            name, apiStages,
                            description,
                            quota
                        })=>apiStages
                    .map(({apiId})=>(
                    <Col xs={12} md={6} lg={4} key={apiId} style={padding}>
                        <ApiCard 
                            //url={match.url} 
                            usagePlanId={usagePlanId} 
                            name={name}
                            description={description}
                            quota={quota}
                        />
                    </Col>
            )))}/>
        </Row>
        <Row>
            <ApiModal/>
            <Link to={match.url+APIEXTENSION}>Api Docs</Link>
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