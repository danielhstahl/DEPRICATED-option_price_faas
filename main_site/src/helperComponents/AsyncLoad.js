import {PureComponent} from 'react'
export default class AsyncLoad extends PureComponent {
    state={isLoading:true}
    componentDidMount() {
        this.props.onLoad(this.props).finally(()=>{
            this.setState({
                isLoading:false
            })
        })
    }
    render() {
        const {isLoading}=this.state
        return isLoading?
            this.props.loading():
            this.props.render(this.props)
    }
}
  