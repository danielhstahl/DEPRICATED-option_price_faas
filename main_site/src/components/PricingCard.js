import React from 'react'
import {
    Row, Col, Card, CardBody,
    CardHeader, CardTitle, 
    Button
} from 'reactstrap'

import {
    SubscribeButton, 
    UnSubscribeButton
} from './SubscriptionButtons'

const freeTier=[
    '10 API calls free per month',
    'No Credit Card required',
]
const paidTier=[
    'Nearly unlimited API calls',
    'Email support'
]

const 

const IfSignedIn=({
    isSignedIn, renderIfYes, renderIfNo
})=>isSignedIn?
    renderIfYes():
    renderIfNo()

const IfSubscribed=({
    isSubscribed, renderIfYes, renderIfNo
})=>isSubscribed?
    renderIfYes():
    renderIfNo()


const PricingCard=({
    title, price, attributes,
    buttonText, outline, link,
    isSignedIn
})=>(
<Card className='text-center'>
    <CardHeader>
        <h4>{title}</h4>
    </CardHeader>
    <CardBody>
        <CardTitle tag='h1'>
            ${price} <small className="text-muted">/ API call</small>
        </CardTitle>
        <ul className="list-unstyled">
            {attributes.map(v=><li key={v}>{v}</li>)}
        </ul>
        <IfSignedIn
            isSignedIn={isSignedIn}
            renderIfNo={()=>(
                <Link to={link}>
                    <Button color='primary' outline={outline}>
                        {buttonText}
                    </Button>
                </Link>
            )}
            renderIfYes={()=>(
                <IfSubscribed 
                    isSubscribed={subscriptions.find(({id})=>id===usagePlanId)}
            )}
        />
        <Link to={link}><Button color='primary' outline={outline}>{buttonText}</Button></Link>
    </CardBody>
</Card>
)

