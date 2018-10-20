import React from 'react'
import PropTypes from 'prop-types'
import {
    Button, Form, FormGroup,
    Label, Input, Alert
} from 'reactstrap'
import { connect } from 'react-redux'
import { register } from '../services/auth'
import {loginError, updateLoggingIn} from '../actions/signIn'
import Loading from '../components/Loading'
import {HOME} from '../routes/names'

const goToPreviousPageOrHome=(fn, history, loginError, updateLoggingIn)=>{
    const navigate=history.length>0?history.goBack:()=>history.push(HOME)
    return e=>{
        updateLoggingIn(true)
        fn(e).then(navigate).catch(loginError).then(()=>updateLoggingIn(false))
    }
}

export const SignIn=({
    register, isLoggingIn, 
    history, loginError, 
    error, updateLoggingIn, 
    token, paidUsagePlanId, 
    freeUsagePlanId, isFromMarketPlace
})=>(
    <Form 
        onSubmit={goToPreviousPageOrHome(
            register({
                paidUsagePlanId, freeUsagePlanId, 
                token, isFromMarketPlace
            }), history, 
            loginError, updateLoggingIn
        )}
    >
        {error&&<Alert color='danger'>{error.message}</Alert>}
        <FormGroup>
            <Label for='emailId'>Email</Label>
            <Input type='email' name='email' id='emailId'/>
        </FormGroup>
        <FormGroup>
            <Label for='passwordId'>Password</Label>
            <Input type='password' name='password' id='passwordId'/>
        </FormGroup>
        {isLoggingIn?
            <Loading/>:
            <Button 
                color='primary'
                className="login-form-button"
            >
                Register/Log In
            </Button>
        }
    </Form>
)
SignIn.propTypes={
    register:PropTypes.func.isRequired,
    isLoggingIn:PropTypes.bool.isRequired,
    history:PropTypes.shape({
        goBack:PropTypes.func.isRequired,
        push:PropTypes.func.isRequired,
        length:PropTypes.number.isRequired
    }).isRequired,
    loginError:PropTypes.func.isRequired,
    error:PropTypes.shape({
        message:PropTypes.string.isRequired,
    }),
    updateLoggingIn:PropTypes.func.isRequired,
    token:PropTypes.string,
    paidUsagePlanId:PropTypes.string,
    freeUsagePlanId:PropTypes.string,
    isFromMarketPlace:PropTypes.bool.isRequired
}
const getForm=fn=>aggr=>e=>{
    e.preventDefault()
    const [{value:email}, {value:password}]=e.target
    return fn(aggr)(email, password)
}
const mapDispatchToProps=dispatch=>({
    register:getForm(register(dispatch)),
    loginError:loginError(dispatch),
    updateLoggingIn:isLoggingIn=>updateLoggingIn(dispatch, isLoggingIn)
})
const mapStateToProps=({
    loading:{isLoggingIn}, auth:{error, token, paidUsagePlanId, isFromMarketPlace},
    catalog:{free:{id:freeUsagePlanId}}
})=>({
    isLoggingIn, error, 
    token, paidUsagePlanId, 
    freeUsagePlanId, 
    isFromMarketPlace
})

export default connect(
    mapStateToProps, 
    mapDispatchToProps
)(SignIn)