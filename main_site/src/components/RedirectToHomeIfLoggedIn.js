import React from 'react'
import {Redirect} from 'react-router'
import {connect} from 'react-redux'
import {HOME} from '../routes/names'
import PropTypes from 'prop-types'
export const RedirectToHomeIfLoggedIn= ({isSignedIn, children})=>isSignedIn?
    <Redirect to={HOME}/>:
    children

RedirectToHomeIfLoggedIn.propTypes={
    isSignedIn:PropTypes.bool,
    children:PropTypes.node.isRequired
}

const mapStateToProps=({auth:{isSignedIn}})=>({isSignedIn})
export default connect(
    mapStateToProps
)(RedirectToHomeIfLoggedIn)