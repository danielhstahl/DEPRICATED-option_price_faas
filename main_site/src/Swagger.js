import React, { Component } from 'react'
import 'swagger-ui/dist/swagger-ui.css'
import SwaggerUI from 'swagger-ui'
import GitCommit from './_git_commit'
export default class SwaggerTest extends Component {
  componentDidMount() {
    SwaggerUI({
      dom_id: '#swaggerContainer',
      url:
        `https://cdn.rawgit.com/phillyfan1138/option_price_faas/${GitCommit.tag}/docs/openapi_merged.yml`
      //presets: [presets.apis],
    })
  }
  render() {
    return <div id="swaggerContainer" />
  }
}
