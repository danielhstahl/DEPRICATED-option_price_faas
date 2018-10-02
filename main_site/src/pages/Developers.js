import React from 'react'
import {  Row, Col, Card, Button } from 'antd'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import Loading from '../components/Loading'
import ApiModal from '../components/ApiModal'
import AsyncLoad from '../components/AsyncLoad'
import {
    addSubscription, removeSubscription, 
    getCatalog, getSubscriptions
} from '../services/api-catalog'

const UnsubscribeButton=({unsubscribe, usagePlanId, client})=>(
    <Button onClick={()=>unsubscribe(usagePlanId, client)}>
        Unsubscribe
    </Button>
)
const SubscribeButton=({subscribe, usagePlanId, client})=>(
    <Button onClick={()=>subscribe(usagePlanId, client)}>
        Subscribe
    </Button>
)

const ChooseButton=({
    isSubscribed, unsubscribe, 
    subscribe, usagePlanId, client
})=>isSubscribed?
    <UnsubscribeButton 
        unsubscribe={unsubscribe} 
        usagePlanId={usagePlanId} 
        client={client}
    />:
    <SubscribeButton
        subscribe={subscribe} 
        usagePlanId={usagePlanId} 
        client={client}
    />

const padding={paddingTop:20}



export const Developers=({
    catalog, isSignedIn, getCatalog, 
    subscriptions, subscribe, 
    unsubscribe, client, 
    getSubscriptions, apiKey,
    match
})=>(
<AsyncLoad 
    requiredObject={catalog.length>0} 
    onLoad={getCatalog} 
    loading={Loading} 
    render={()=>(
    <Row gutter={16} key='apirow' type="flex" justify="space-around" >
        {catalog.map(({id:usagePlanId, name, apis})=>apis.map(({id:apiId})=>(
            <Col xs={24} md={12} lg={8} key={apiId} style={padding}>
                <Card title={name} extra={<Link to={`${match.url}/api_docs`}>Api Docs</Link>}>
                    {
                        isSignedIn?[
                            <AsyncLoad 
                                key='subscription'
                                requiredObject={subscriptions.length>0}
                                onLoad={()=>getSubscriptions(client)}
                                loading={Loading}
                                render={()=>(
                                    <ChooseButton 
                                        isSubscribed={subscriptions.find(({id})=>id===usagePlanId)}
                                        unsubscribe={unsubscribe}
                                        subscribe={subscribe}
                                        usagePlanId={usagePlanId}
                                        client={client}
                                    />
                                )}
                            />,
                            <ApiModal key='apimodal'/>
                        ]:<p>Log in to view subscriptions</p>
                    }
                </Card>
            </Col>
        )))}
    </Row>
)}/>
)
const mapStateToProps=({catalog, auth:{isSignedIn, apiKey}, subscriptions, client})=>({
    catalog,
    isSignedIn,
    subscriptions,
    client,
    apiKey
})

const mapDispatchToProps=dispatch=>({
    subscribe:addSubscription(dispatch),
    unsubscribe:removeSubscription(dispatch),
    getSubscriptions:getSubscriptions(dispatch),
    getCatalog:getCatalog(dispatch)
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Developers)