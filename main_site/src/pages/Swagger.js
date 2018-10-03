import React, { Component } from 'react'
import 'swagger-ui/dist/swagger-ui.css'
import SwaggerUI from 'swagger-ui'
export default class SwaggerTest extends Component {
  componentDidMount() {
    SwaggerUI({
      dom_id: '#swaggerContainer',
      url: `https://cdn.rawgit.com/phillyfan1138/option_price_faas/${
        process.env.REACT_APP_TAG||"v24"
      }/docs/openapi_merged.yml`
      //presets: [presets.apis],
    })
  }
  render() {
    return <div id="swaggerContainer" />
  }
}
