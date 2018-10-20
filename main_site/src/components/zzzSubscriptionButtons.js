import React from 'react'
import {
    addSubscription, 
    removeSubscription
} from '../services/api-catalog'

const GenericSubscriptionButton=({subscribeFn, usagePlanId, client, children, ...props})=>(
    <Button 
        onClick={()=>subscribeFn(usagePlanId, client)} 
        {...props}
        color='primary'
    >
        {children}
    </Button>
)

export const RegisterButton=({
   link, outline, children
})=>(
    <Link to={link}>
        <Button 
            color='primary' 
            outline={outline}
        >
            {children}
        </Button>
    </Link>
)

const mapStateToProps=({client})=>({client})
//const mapStateToRegister=({auth:{isSignedIn}})=>({isSignedIn})
const mapDispatchToSubscribe=dispatch=>({
    subscribeFn:addSubscription(dispatch)
})

const mapDispatchToUnSubscribe=dispatch=>({
    subscribeFn:removeSubscription(dispatch)
})

export const SubscribeButton=connect(
    mapStateToProps,
    mapDispatchToSubscribe
)(GenericSubscriptionButton)

export const UnSubscribeButton=connect(
    mapStateToProps,
    mapDispatchToUnSubscribe
)(GenericSubscriptionButton)



