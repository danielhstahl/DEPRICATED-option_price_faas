import {
    TOGGLE_OPEN
} from '../actions/constants'

import {combineReducers} from 'redux'

const isOpen=(state=false, action)=>{
    switch(action.type){
        case TOGGLE_OPEN:
            return !state
        default:
            return state
    }
}

export default combineReducers({
    isOpen
})