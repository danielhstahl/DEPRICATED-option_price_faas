const { injectBabelPlugin } = require('react-app-rewired')
const rewireLess = require('react-app-rewire-less')

module.exports = function override(config, env) {
  const config_babel = injectBabelPlugin(
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }], // change importing css to less
    config,
  )
  const config_babel_loader = rewireLess.withLoaderOptions({
    modifyVars: { 
      "@primary-color": "#009688",  
      '@link-color': '#009688',
      '@font-size-base': '25px',
      '@layout-header-background': '#f50057'
    },
    javascriptEnabled: true,
  })(config_babel, env)
  return config_babel_loader
}

