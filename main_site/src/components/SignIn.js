import React from 'react'
import {
    Button, Form, FormGroup,
    Label, Input, Alert
} from 'reactstrap'
import { connect } from 'react-redux'
import { register, login } from '../services/auth'
import {loginError, updateLoggingIn} from '../actions/signIn'
import Loading from '../components/Loading'
import {HOME} from '../routes/names'

const goToPreviousPageOrHome=(fn, history, loginError, updateLoggingIn)=>{
    const navigate=history.length>0?history.goBack:()=>history.push(HOME)
    return e=>{
        updateLoggingIn(true)
        fn(e).then(navigate).catch(loginError).finally(()=>updateLoggingIn(false))
    }
}
export const SignIn=({
    isRegistration, login, register, 
    isLoggingIn, history, loginError,
    error, updateLoggingIn
})=>(
    <Form 
        onSubmit={goToPreviousPageOrHome(
            isRegistration?register:login, 
            history, loginError, updateLoggingIn
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
                {isRegistration?'Register':'Log In'}
            </Button>
        }
        
    </Form>
)
const getForm=(fn, dispatch)=>e=>{
    e.preventDefault()
    const [{value:email}, {value:password}]=e.target
    return fn(dispatch)(email, password)
}
const mapDispatchToProps=dispatch=>({
    register:getForm(register, dispatch),
    login:getForm(login, dispatch),
    loginError:loginError(dispatch),
    updateLoggingIn:isLoggingIn=>updateLoggingIn(dispatch, isLoggingIn)
})
const mapStateToProps=({loading:{isLoggingIn}, auth:{error}})=>({isLoggingIn, error})

export default connect(
    mapStateToProps, 
    mapDispatchToProps
)(SignIn)