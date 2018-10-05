import {
    TOGGLE_MENU_NAV
} from '../actions/constants'

export default (state=false, action)=>{
    switch(action.type){
        case TOGGLE_MENU_NAV:
            return !state
        default:
            return state
    }
}