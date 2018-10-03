import React from 'react'
import { 
    Button, Form, 
    Icon, Input
} from 'antd'
import { connect } from 'react-redux'
import { register, login } from '../services/auth'
import Loading from '../components/Loading'

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
export const SignIn=({isRegistration, login, register, isLoggingIn})=>isLoggingIn?
    <Loading/>:
    <Form onSubmit={isRegistration?register:login} style={maxWidth}>
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
                Log in
            </Button>
        </FormItem>
    </Form>

const getForm=(fn, dispatch)=>e=>{
    e.preventDefault()
    const [{value:email}, {value:password}]=e.target
    fn(dispatch)(email, password)
}
const mapDispatchToProps=dispatch=>({
    register:getForm(register, dispatch),
    login:getForm(login, dispatch),
})
const mapStateToProps=({loading:{isLoggingIn}})=>({isLoggingIn})

export default connect(
    mapStateToProps, 
    mapDispatchToProps
)(SignIn)