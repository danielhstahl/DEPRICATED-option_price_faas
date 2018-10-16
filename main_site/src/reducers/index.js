import auth from './auth'
import catalog from './catalog'
import subscriptions from './subscriptions'
import menu from './menu'
import client from './client'
import loading from './loading'
import modal from './modal'
import {combineReducers} from 'redux'
export default combineReducers({
    auth,
    catalog,
    client,
    menu,
    //subscriptions,
    loading,
    modal
})
