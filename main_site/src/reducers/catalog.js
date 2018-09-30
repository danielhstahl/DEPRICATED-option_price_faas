import {UPDATE_CATALOG} from '../actions/constants'
export default (state=[], action)=>{
    switch(action.type){
        case UPDATE_CATALOG:
            return action.value
        default:
            return state
    }
}