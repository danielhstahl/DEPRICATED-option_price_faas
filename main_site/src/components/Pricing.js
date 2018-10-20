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
                {paid.isSubscribed?<ButtonToDeveloperPortal/>:<ButtonToMarketPlace/>}
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