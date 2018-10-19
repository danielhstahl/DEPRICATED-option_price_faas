import React from 'react'
import {
    Row, Col, Card, CardBody,
    CardHeader,  
    Button
} from 'reactstrap'
import { connect } from 'react-redux'
import {getUsage} from '../services/api-catalog'
import AsyncLoad from '../components/AsyncLoad'
import Loading from '../components/Loading'
const paddingTop={paddingTop:20}
const SubscriptionCard=({
    title, children
})=>(
<Card className='text-center'>
    <CardHeader>
        <h4>{title}</h4>
    </CardHeader>
    <CardBody>
        {children}
    </CardBody>
</Card>
)
export const Subscriptions=({style, paid, free, onLoad, client, isSignedIn, getUsage})=>(
    <Row style={style} className='dark-text'>
        <Col xs={12} md={6} style={paddingTop}>
            <SubscriptionCard 
                title='Free Tier'
            >
                {free.id&&isSignedIn?
                <AsyncLoad
                    //requiredObject={free.usagePlanId!==undefined}
                    onLoad={()=>getUsage(free.id, client)}
                    render={()=><div>Hello world</div>}
                    loading={Loading}
                />:<Loading/>}
            </SubscriptionCard>
        </Col>
        <Col xs={12} md={6} style={paddingTop}>
            <SubscriptionCard 
                title='Paid Tier'
            >
                {paid.id&&isSignedIn?
                <AsyncLoad
                    //requiredObject={free.usagePlanId!==undefined}
                    onLoad={()=>getUsage(paid.id, client)}
                    render={()=><div>Hello world</div>}
                    loading={Loading}
                />:<Loading/>}
                <Button>Unsubscribe</Button>
            </SubscriptionCard>
        </Col>
    </Row>
)
const mapStateToProps=({auth:{isSignedIn}, client, catalog:{paid, free}})=>({
    isSignedIn,
    paid,
    free,
    client
})

const mapDispatchToProps=dispatch=>({
    getUsage:getUsage(dispatch)
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Subscriptions)