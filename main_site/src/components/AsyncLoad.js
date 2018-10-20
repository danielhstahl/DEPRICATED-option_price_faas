import {PureComponent} from 'react'
import PropTypes from 'prop-types'
class AsyncLoad extends PureComponent {
    state={isLoading:true}
    componentDidMount() {
        const setLoadingOff=()=>this.setState({
            isLoading:false
        })
        if(!this.props.requiredObject){
            this.props.onLoad(this.props).catch(err=>err).then(setLoadingOff)
        }
        else{
            setLoadingOff()
        }
    }
    render() {
        const {isLoading}=this.state
        const {loading, render}=this.props
        return isLoading?
            loading?loading():null:
            render?render(this.props):null
    }
}
AsyncLoad.propTypes={
    requiredObject:PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.bool]),
    onLoad:PropTypes.func.isRequired,
    render:PropTypes.func,
    loading:PropTypes.func
}
export default AsyncLoad