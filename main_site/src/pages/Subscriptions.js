import React from 'react'
import {
    Row, Col, Card, CardBody,
    CardHeader,  Alert,
    Button, Container
} from 'reactstrap'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {removePaidSubscription, getSubscriptionUsage} from '../actions/subscriptions'
import AsyncLoad from '../components/AsyncLoad'
import Loading from '../components/Loading'
const paddingTop={paddingTop:20}
export const SubscriptionCard=({
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

export const getFirstOfNestedOrNonsenseKey=arr=>arr&&arr.length>0?arr[0]:'key'

export const convertUsage=items=>{
    const usage=items[getFirstOfNestedOrNonsenseKey(Object.keys(items))]||[[]]
    return usage.reduce((aggr, [dailyUsage])=>aggr+dailyUsage, 0)||0
}

export const renderUsage=(subscriptionObject, isSubscribed, onUnsubscribe, isUnRegistering, error)=>()=>{
    const {items, quota, startDate}=subscriptionObject
    return <div>
        Usage since {startDate}: {convertUsage(items)} out of {quota.limit}.
        {onUnsubscribe&&isSubscribed?(isUnRegistering?<Loading/>:<Button onClick={onUnsubscribe}>Unsubscribe</Button>):null}
        {error&&<Alert color='danger'>{error.message}</Alert>}
    </div>
}
export const Subscriptions=({
    style, paid, free,  
    client, isSignedIn, getUsage,
    isUnRegistering, error,
    removePaidSubscription
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
                        ()=>removePaidSubscription(paid.id, free.id, client), isUnRegistering, error
                    )}
                    loading={Loading}
                />:<Loading/>}
                
            </SubscriptionCard>
        </Col>
    </Row>
</Container>
)

Subscriptions.propTypes={
    style:PropTypes.object,
    paid:PropTypes.shape({
        quota:PropTypes.shape({
            limit:PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            period:PropTypes.string.isRequired
        }).isRequired,
        id:PropTypes.string,
        isSubscribed:PropTypes.bool
    }).isRequired,
    free:PropTypes.shape({
        quota:PropTypes.shape({
            limit:PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            period:PropTypes.string.isRequired
        }).isRequired,
        id:PropTypes.string,
        isSubscribed:PropTypes.bool
    }).isRequired,
    client:PropTypes.object,
    isSignedIn:PropTypes.bool,
    getUsage:PropTypes.func.isRequired,
    isUnRegistering:PropTypes.bool.isRequired,
    error:PropTypes.shape({
        message:PropTypes.string.isRequired
    }),
    removePaidSubscription:PropTypes.func.isRequired
}

const mapStateToProps=({
    auth:{isSignedIn}, client, 
    catalog:{paid, free},
    errors:{subscriptionError:error},
    loading:{isUnRegistering}
})=>({
    isSignedIn,
    error,
    paid,
    free,
    client,
    isUnRegistering
})

const mapDispatchToProps=dispatch=>({
    getUsage:getSubscriptionUsage(dispatch),
    removePaidSubscription:removePaidSubscription(dispatch)
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Subscriptions)