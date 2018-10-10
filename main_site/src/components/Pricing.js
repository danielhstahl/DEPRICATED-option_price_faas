import React from 'react'
import {
    Row, Col, Card, CardBody,
    CardHeader, CardTitle, 
    Button
} from 'reactstrap'
import {Link} from 'react-router-dom'
import {REGISTER} from '../routes/names'
const freeTier=[
    '10 API calls free per month',
    'No Credit Card required',
]
const paidTier=[
    'Nearly unlimited API calls',
    'Email support'
]
/*const getMinHeight=()=>{
    const maxLength=Math.max(freeTier.length, paidTier.length)
    return 180+maxLength*24
}*/
const paddingTop={paddingTop:20}

const PricingCard=({
    title, price, attributes,
    buttonText, outline, link
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
        <Link to={link}><Button color='primary' outline={outline}>{buttonText}</Button></Link>
    </CardBody>
</Card>
)

export default ({style})=>(
<Row style={style} className='dark-text'>
    <Col xs={12} md={6} style={paddingTop}>
        <PricingCard
            title='Free Tier'
            price='0'
            attributes={freeTier}
            buttonText='Sign up for free!'
            outline={false}
            link={REGISTER}
        />
        
    </Col>
    <Col xs={12} md={6} style={paddingTop}>
        <PricingCard
            title='Paid Tier'
            price='1'
            attributes={paidTier}
            buttonText='Get Started!'
            outline={true}
            link={REGISTER}
        />
        
    </Col>

</Row>
)