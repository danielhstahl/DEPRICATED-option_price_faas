import auth from './auth'
import catalog from './catalog'
import menu from './menu'
import errors from './errors'
import client from './client'
import loading from './loading'
import modal from './modal'
import {combineReducers} from 'redux'
export default combineReducers({
    auth,
    catalog,
    client,
    menu,
    errors,
    loading,
    modal
})
