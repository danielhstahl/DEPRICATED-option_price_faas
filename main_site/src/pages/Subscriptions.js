import React from 'react'
import {
    Row, Col, Card, CardBody,
    CardHeader,  
    Button, Container
} from 'reactstrap'
import { connect } from 'react-redux'
import {getUsage} from '../services/api-catalog'
import {removePaidSubscription} from '../actions/subscriptions'
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

const getFirstOfNestedOrNonsenseKey=arr=>arr&&arr.length>0?arr[0]:'key'
const convertUsage=items=>{
    const usage=items[getFirstOfNestedOrNonsenseKey(Object.keys(items))]||[[]]
    return usage.reduce((aggr, [dailyUsage])=>aggr+dailyUsage, 0)||0
}

const renderUsage=(subscriptionObject, isSubscribed, onUnsubscribe, isUnRegistering)=>()=>{
    const {items, quota, startDate}=subscriptionObject
    return <div>
        Usage since {startDate}: {convertUsage(items)} out of {quota.limit}.
        {onUnsubscribe&&isSubscribed?(isUnRegistering?<Loading/>:<Button onClick={onUnsubscribe}>Unsubscribe</Button>):null}
    </div>
}
export const Subscriptions=({
    style, paid, free,  
    client, isSignedIn, getUsage,
    isUnRegistering
})=>(
<Container key='container'>
    <Row style={style} className='dark-text'>
        <Col xs={12} md={6} style={paddingTop}>
            <SubscriptionCard 
                title='Free Tier'
            >
                {free.id&&isSignedIn?
                <AsyncLoad
                    onLoad={()=>getUsage(free.id, client)}
                    render={renderUsage(free, free.isSubscribed)}
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
                    onLoad={()=>getUsage(paid.id, client)}
                    render={renderUsage(
                        paid, paid.isSubscribed,  
                        ()=>removePaidSubscription(paid.id, free.id, client), isUnRegistering
                    )}
                    loading={Loading}
                />:<Loading/>}
                
            </SubscriptionCard>
        </Col>
    </Row>
</Container>
)

const mapStateToProps=({
    auth:{isSignedIn}, client, 
    catalog:{paid, free},
    loading:{isUnRegistering}
})=>({
    isSignedIn,
    paid,
    free,
    client,
    isUnRegistering
})

const mapDispatchToProps=dispatch=>({
    getUsage:getUsage(dispatch),
    removePaidSubscription:removePaidSubscription(dispatch)
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Subscriptions)