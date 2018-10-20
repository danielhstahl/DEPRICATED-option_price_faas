import React from 'react'
//import ReactDOM from 'react-dom'
import App from './App'
//import awsApp from './reducers'
//import { createStore } from 'redux'
import { Provider } from 'react-redux'
import {  mount } from 'enzyme'
import Loading from './components/Loading'
import configureStore from 'redux-mock-store'
import { BrowserRouter as Router } from 'react-router-dom'
import SuccessMarketPlaceRegister from './pages/SuccessMarketPlaceRegister'

const mockStore = configureStore([])
/*
it('renders without crashing', () => {
  const store=createStore(awsApp)
  const div = document.createElement('div')
  ReactDOM.render(<Provider store={store}><App /></Provider>, div)
  ReactDOM.unmountComponentAtNode(div)
})*/

//note that there will be not be any actual API calls if catalog.free.id is defined at this level
it('renders loading if registering from marketplace', ()=>{
  const initialState={
    auth:{
      isFromMarketPlace:true,
      isSignedIn:undefined,
    },
    catalog:{
      free:{
        id:'123',
        quota:{period:'month'}
      },
      paid:{
        quota:{period:'month'}
      }
    }
  }
  const store=mockStore(initialState)
  const app=mount(<Provider store={store}><App /></Provider>)
  expect(app.find(Router).length).toEqual(0)
  expect(app.find(Loading).length).toEqual(1)
})
it('renders loading if registering from marketplace, is signedIn, but no catalog', ()=>{
  const initialState={
    auth:{
      isFromMarketPlace:true,
      isSignedIn:true,
    },
    catalog:{
      free:{
        quota:{period:'month'}
      },
      paid:{
        quota:{period:'month'}
      }
    }
  }
  const store=mockStore(initialState)
  const app=mount(<Provider store={store}><App /></Provider>)
  expect(app.find(Router).length).toEqual(0)
  expect(app.find(Loading).length).toEqual(1)
})
it('renders Router if not registering from marketplace', ()=>{
  const initialState={
    auth:{
      isFromMarketPlace:false,
      isSignedIn:undefined,
    },
    catalog:{
      free:{
        id:'123', //required so doesnt try to call catalog
        quota:{period:'month'}
      },
      paid:{
        quota:{period:'month'}
      }
    }
  }
  const store=mockStore(initialState)
  const app=mount(<Provider store={store}><App /></Provider>)
  expect(app.find(Router).length).toEqual(1)
  expect(app.find(Loading).length).toEqual(0)
})
it('renders Router if registering from marketplace and has signed in and has catalog', ()=>{
  const initialState={
    auth:{
      isFromMarketPlace:true,
      isSignedIn:true,
    },
    catalog:{
      free:{
        id:'123',
        quota:{period:'month'}
      },
      paid:{
        quota:{period:'month'}
      }
    }
  }
  const store=mockStore(initialState)
  const app=mount(<Provider store={store}><App /></Provider>)
  expect(app.find(Router).length).toEqual(1)
  expect(app.find(Loading).length).toEqual(0)
})
it('renders SuccessMarketPlaceRegister if registering from marketplace and has signed in and has catalog', ()=>{
  const initialState={
    auth:{
      isFromMarketPlace:true,
      isSignedIn:true,
    },
    catalog:{
      free:{
        id:'123',
        quota:{period:'month'}
      },
      paid:{
        quota:{period:'month'}
      }
    }
  }
  const store=mockStore(initialState)
  const app=mount(<Provider store={store}><App /></Provider>)
  expect(app.find(SuccessMarketPlaceRegister).length).toEqual(1)
})