import React from 'react'
import {
    Row, Col, Card, CardBody,
    CardHeader, CardTitle, 
    Button
} from 'reactstrap'
import { connect } from 'react-redux'
import {Link} from 'react-router-dom'
import {REGISTER, DEVELOPERS, MARKETPLACE} from '../routes/names'

const paddingTop={paddingTop:20}
const PricingCard=({
    title, price, quota, children
})=>(
<Card className='text-center'>
    <CardHeader>
        <h4>{title}</h4>
    </CardHeader>
    <CardBody>
        <CardTitle tag='h1'>
            ${price} <small className="text-muted">/ API call</small>
        </CardTitle>
        <p>{quota.limit} API calls per {quota.period.toLowerCase()}</p>
        {children}
    </CardBody>
</Card>
)

const ButtonToDeveloperPortal=()=><Link to={DEVELOPERS}><Button color='primary'>Sandbox</Button></Link>

const ButtonToRegister=()=><Link to={REGISTER}><Button color='primary'>Register Now!</Button></Link>

const ButtonToMarketPlace=()=><Link to={MARKETPLACE}><Button color='primary' outline>Get Started!</Button></Link>
//need to update Paid Tier to also check for subscription.  I think that they should automatically be subscribed to the free tier.  
//TODO!! 
//If redirected from the marketplace, go straight to registration.  Need to wrap registration with Async for catalog...or do I...I think I just need marketplaceAuth?
//All "purchase" links should go to the marketplace at this point
//Then when registering, automatically register for the free plan
//Even after registering, all "purchase" links need to go to the
//marketplace to get a token.
//The question is, what to do when redirected AND registered?  How
//should the user "choose" to purchase?  Also, how does the API
//know which usage plan?  I think I'll need to unregister
//from the free plan when moving to the paid plan.  
export const Pricing=({style, paid, free, isSignedIn})=>(
    <Row style={style} className='dark-text'>
        <Col xs={12} md={6} style={paddingTop}>
            <PricingCard
                title='Free Tier'
                price='0'
                quota={free.quota}
            >
                <p>No credit card required</p>
                {isSignedIn?<ButtonToDeveloperPortal/>:<ButtonToRegister/>}
            </PricingCard>
        </Col>
        <Col xs={12} md={6} style={paddingTop}>
            <PricingCard
                title='Paid Tier'
                price='1'
                quota={paid.quota}
            >
                <p>Email support</p>
                <ButtonToMarketPlace/>
            </PricingCard>
        </Col>
    </Row>
)

const mapStateToProps=({auth:{isSignedIn}, catalog:{paid, free}})=>({
    isSignedIn,
    paid,
    free
})

export default connect(
    mapStateToProps
)(Pricing)