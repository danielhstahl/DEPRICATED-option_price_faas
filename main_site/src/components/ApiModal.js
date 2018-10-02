import React from 'react'
import { Button, Modal } from 'antd'
import { connect } from 'react-redux'
import {
    toggleOpen
} from '../actions/modal'
import AsyncLoad from '../components/AsyncLoad'
import {showApiKey} from '../services/auth'
import Loading from '../components/Loading'

const mapStateToProps=({modal:{isOpen}, auth:{isSignedIn, apiKey}, client})=>({
    isOpen, isSignedIn, apiKey, client
})
const mapDispatchToProps=dispatch=>({
    toggleOpen:toggleOpen(dispatch),
    onLoad:showApiKey(dispatch)
})
export const ApiModal=({isOpen, toggleOpen, isSignedIn, apiKey, client, onLoad})=>[
    <Button onClick={toggleOpen} key='button'>View API Key</Button>,
    <Modal 
        key='modal' title='API Key' visible={isOpen} 
        onOk={toggleOpen} onCancel={toggleOpen}
    >
        <AsyncLoad requiredObject={apiKey} onLoad={()=>onLoad(client)} loading={Loading} render={()=>(
            <p>{apiKey}</p>
        )}/>
    </Modal>
]

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ApiModal)
