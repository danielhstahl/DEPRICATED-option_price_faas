import auth from './auth'
import catalog from './catalog'
import subscriptions from './subscriptions'
import client from './client'
import loading from './loading'
import modal from './modal'
import {combineReducers} from 'redux'
export default combineReducers({
    auth,
    catalog,
    client,
    subscriptions,
    loading,
    modal
})
