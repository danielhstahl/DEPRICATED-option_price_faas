import React from 'react'
import { 
    Button, Form, 
    Icon, Input 
} from 'antd'
import { connect } from 'react-redux'
import { register, login } from '../services/auth'
//import { confirmMarketplaceSubscription } from '../services/api-catalog'
const FormItem = Form.Item
const UserIcon=<Icon 
    type="user" 
    style={{ color: 'rgba(0,0,0,.25)' }} 
/>
const PasswordIcon=<Icon 
    type="lock"
    style={{ color: 'rgba(0,0,0,.25)' }} 
/> 
export const SignIn=({login, isSignedIn})=>isSignedIn?<div>Welcome</div>:
(
    <Form onSubmit={login}>
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
)

const mapDispatchToProps=dispatch=>({
    register:e=>{
        e.preventDefault()
        //console.log(e.target)
        const [{value:email}, {value:password}]=e.target
        register(dispatch)(email, password)
        //register(dispatch)(email, password)
    },
    login:e=>{
        e.preventDefault()
        //console.log(e.target)
        const [{value:email}, {value:password}]=e.target
        login(dispatch)(email, password)
        //register(dispatch)(email, password)
    }
})
const mapStateToProps=({auth:{isSignedIn}})=>({isSignedIn})
export default connect(
    mapStateToProps, 
    mapDispatchToProps
)(SignIn)