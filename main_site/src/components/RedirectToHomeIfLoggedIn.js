import React from 'react'
import {Redirect} from 'react-router'
import {connect} from 'react-redux'
import {HOME} from '../routes/names'
export const RedirectToHomeIfLoggedIn= ({isSignedIn, children})=>isSignedIn?
    <Redirect to={HOME}/>:
    children

const mapStateToProps=({auth:{isSignedIn}})=>({isSignedIn})
export default connect(
    mapStateToProps
)(RedirectToHomeIfLoggedIn)