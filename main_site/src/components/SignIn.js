import React from 'react'
import { 
    Button, Form, 
    Icon, Input, Alert
} from 'antd'
import { connect } from 'react-redux'
import { register, login } from '../services/auth'
import {loginError, updateLoggingIn} from '../actions/signIn'
import Loading from '../components/Loading'
import {HOME} from '../routes/names'

const FormItem = Form.Item
const UserIcon=<Icon 
    type="user" 
    style={{ color: 'rgba(0,0,0,.25)' }} 
/>
const PasswordIcon=<Icon 
    type="lock"
    style={{ color: 'rgba(0,0,0,.25)' }} 
/> 
const maxWidth={maxWidth:600}
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
})=>isLoggingIn?
    <Loading/>:
    <Form 
        onSubmit={goToPreviousPageOrHome(
            isRegistration?register:login, 
            history, loginError, updateLoggingIn
        )} 
        style={maxWidth}
    >
        <FormItem>
            <Input 
                prefix={UserIcon} placeholder="Username" 
            />
        </FormItem>
        <FormItem>
            <Input 
                prefix={PasswordIcon} 
                placeholder="Password" 
                type="password"
            />
        </FormItem>
        <FormItem>
            <Button 
                type="primary" 
                htmlType="submit"    
                className="login-form-button"
            >
                {isRegistration?'Register':'Log In'}
            </Button>
        </FormItem>
        {error&&<Alert
            message={error.message}
            type="error"
        />}
    </Form>

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