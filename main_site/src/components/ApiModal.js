import React from 'react'
import {Button, Modal, ModalHeader, ModalBody} from 'reactstrap'
import { connect } from 'react-redux'
import {
    toggleOpen
} from '../actions/modal'
import AsyncLoad from './AsyncLoad'
import {showApiKey} from '../services/auth'
import Loading from './Loading'

const mapStateToProps=({modal:{isOpen}, auth:{apiKey, isSignedIn}, client})=>({
    isOpen, apiKey, client
})
const mapDispatchToProps=dispatch=>({
    toggleOpen:toggleOpen(dispatch),
    onLoad:showApiKey(dispatch)
})
export const ApiModal=({isOpen, toggleOpen, apiKey, client, onLoad, isSignedIn})=>[
    isSignedIn?<Button 
        onClick={toggleOpen} 
        key='button'
    >
        View API Key
    </Button>:null,
    <Modal 
        key='modal' isOpen={isOpen} 
        toggle={toggleOpen} 
    >
        <ModalHeader>API Key</ModalHeader>
        <AsyncLoad requiredObject={apiKey} onLoad={()=>onLoad(client)} loading={Loading} render={()=>(
            <ModalBody>{apiKey}</ModalBody>
        )}/>
    </Modal>
]

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ApiModal)
