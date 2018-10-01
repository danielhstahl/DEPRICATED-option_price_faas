import React from 'react'
import {  Row, Col, Card, Button, Spin } from 'antd'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import AsyncLoad from '../helperComponents/AsyncLoad'
import {addSubscription, removeSubscription, getCatalog, getSubscriptions} from '../services/api-catalog'
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
const centerStyle={marginRight:'50%', marginLeft:'50%'}
const padding={paddingTop:20}
const loading=()=><Spin style={centerStyle}/>
export const Products=({
    catalog, isSignedIn, getCatalog, 
    subscriptions, subscribe, 
    unsubscribe, client, getSubscriptions
})=>(
<AsyncLoad onLoad={getCatalog} loading={loading} render={()=>(
    <Row gutter={16} key='summary' type="flex" justify="space-around" >
        {catalog.map(({id:usagePlanId, name, apis})=>apis.map(({id:apiId})=>(
            <Col xs={24} md={12} lg={8} key={apiId} style={padding}>
                <Card title={name} extra={<Link to="/api_docs">Api Docs</Link>}>
                    {
                        //TODO!!!  make subscriptions find the subscription id (I currently don't know what the subscription keys are)
                        isSignedIn?(
                            <AsyncLoad 
                                onLoad={()=>getSubscriptions(client)}
                                loading={loading}
                                render={()=>(
                                    <ChooseButton 
                                        isSubscribed={subscriptions.find(({id})=>id===usagePlanId)}
                                        unsubscribe={unsubscribe}
                                        subscribe={subscribe}
                                        usagePlanId={usagePlanId}
                                        client={client}
                                    />
                                )}
                            />
                        ):<Link to="/log_in">Log In</Link>
                    }
                </Card>
            </Col>
        )))}
    </Row>
)}/>
)
const mapStateToProps=({catalog, auth:{isSignedIn}, subscriptions, client})=>({
    catalog,
    isSignedIn,
    subscriptions,
    client
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
)(Products)