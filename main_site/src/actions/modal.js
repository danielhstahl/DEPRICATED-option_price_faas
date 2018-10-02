import {
    TOGGLE_OPEN
} from './constants'

export const toggleOpen=dispatch=>()=>dispatch({
    type:TOGGLE_OPEN
})