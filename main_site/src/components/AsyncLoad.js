import {PureComponent} from 'react'
export default class AsyncLoad extends PureComponent {
    state={isLoading:true}
    componentDidMount() {
        const setLoadingOff=()=>this.setState({
            isLoading:false
        })
        if(!this.props.requiredObject){
            this.props.onLoad(this.props).finally(setLoadingOff)
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
  