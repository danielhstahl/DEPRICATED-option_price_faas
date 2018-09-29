const { injectBabelPlugin } = require('react-app-rewired')
const rewireLess = require('react-app-rewire-less')

module.exports = function override(config, env) {
  const config_babel = injectBabelPlugin(
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }], // change importing css to less
    config,
  )
  const config_babel_loader = rewireLess.withLoaderOptions({
    modifyVars: { 
      "@primary-color": "#eb2f96",  
      '@link-color': '#eb2f96',
      '@font-size-base': '20px',
      '@layout-header-background': '#030852'
    },
    javascriptEnabled: true,
  })(config_babel, env)
  return config_babel_loader
}

