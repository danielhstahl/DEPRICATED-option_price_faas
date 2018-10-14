import React from 'react'
import {
    Card, Button, CardBody, 
    CardTitle, CardText
} from 'reactstrap'
import { connect } from 'react-redux'
import Loading from '../components/Loading'
import AsyncLoad from '../components/AsyncLoad'
import {
    addSubscription, removeSubscription, 
    getSubscriptions
} from '../services/api-catalog'

const marginRight={marginRight:10}
const UnsubscribeButton=({unsubscribe, usagePlanId, client, ...props})=>(
    <Button onClick={()=>unsubscribe(usagePlanId, client)} {...props}>
        Unsubscribe"
    </Button>
)
const SubscribeButton=({subscribe, usagePlanId, client, ...props})=>(
    <Button onClick={()=>subscribe(usagePlanId, client)} {...props}>
        Subscribe
    </Button>
)
const ChooseButton=({
    isSubscribed, unsubscribe, 
    subscribe, usagePlanId, client,
    ...props
})=>isSubscribed?
    <UnsubscribeButton 
        unsubscribe={unsubscribe} 
        usagePlanId={usagePlanId} 
        client={client}
        {...props}
    />:
    <SubscribeButton
        subscribe={subscribe} 
        usagePlanId={usagePlanId} 
        client={client}
        {...props}
    />

export const ApiCard=({
    subscriptions, 
    getSubscriptions,
    name, isSignedIn,
    client, subscribe, 
    description, quota,
    unsubscribe, stages
})=>(
    <Card title={name}>
        <CardBody>
            <CardTitle>{name}</CardTitle>
            <CardText>
                {description}
            </CardText>
            <CardText>
                {quota.limit} API calls per {quota.period.toLowerCase()}
            </CardText>
            {
                isSignedIn?(
                    <AsyncLoad 
                        key='subscription'
                        requiredObject={subscriptions.length>0}
                        onLoad={()=>getSubscriptions(client)}
                        loading={Loading}
                        render={()=>{
                            const {apiId}=stages.find(({stage})=>stage==='prd')
                            return (
                            <ChooseButton 
                                isSubscribed={subscriptions.find(({id})=>id===apiId)}
                                unsubscribe={unsubscribe}
                                style={marginRight}
                                subscribe={subscribe}
                                usagePlanId={apiId}
                                client={client}
                                key={apiId}
                            />
                        )}}
                    />
                ):<CardText>Log in to view subscriptions</CardText>
            }
        </CardBody>
    </Card>
)

const mapStateToProps=({auth:{isSignedIn}, subscriptions, client})=>({
    isSignedIn,
    subscriptions,
    client
})

const mapDispatchToProps=dispatch=>({
    subscribe:addSubscription(dispatch),
    unsubscribe:removeSubscription(dispatch),
    getSubscriptions:getSubscriptions(dispatch)
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ApiCard)