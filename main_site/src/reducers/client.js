import {
    UPDATE_AWS_CLIENT
} from '../actions/constants'

export default (state={}, action)=>{
    switch(action.type){
        case UPDATE_AWS_CLIENT:
            return action.client
        default:
            return state
    }
}