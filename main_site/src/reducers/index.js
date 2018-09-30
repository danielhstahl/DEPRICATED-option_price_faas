import auth from './auth'
import catalog from './catalog'
import subscriptions from './subscriptions'
import {combineReducers} from 'redux'
export default combineReducers({
    auth,
    catalog,
    subscriptions
})
