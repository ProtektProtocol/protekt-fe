import React, { Component } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import {
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import IpfsRouter from 'ipfs-react-router'
import HttpsRedirect from 'react-https-redirect'

import './i18n';
import interestTheme from './theme';

import APR from './components/apr';
import InvestSimple from './components/investSimple';
import Manage from './components/manage';
import Performance from './components/performance';
import Zap from './components/zap';
import IDai from './components/idai';
import Footer from './components/footer';
import Home from './components/home';
import Header from './components/header';
import Vaults from './components/vault';
import AllContracts from './components/allContracts';
import Holdings from './components/holdings';
import Dashboard from './components/dashboard';
import HowItWorks from './components/howItWorks';

import { injected } from "./stores/connectors";


import { 
  CONNECTION_CONNECTED,
} from './constants'

import Store from "./stores";
const emitter = Store.emitter
const store = Store.store

class App extends Component {
  state = {};

  componentWillMount() {
    injected.isAuthorized().then(isAuthorized => {
      if (isAuthorized) {
        injected.activate()
        .then((a) => {
          store.setStore({ account: { address: a.account }, web3context: { library: { provider: a.provider } } })
          emitter.emit(CONNECTION_CONNECTED)
        })
        .catch((e) => {
          console.log(e)
        })
      } else {

      }
    });

    // check window.ethereum is defined
    if(window.ethereum){
      window.ethereum.on('accountsChanged', function (accounts) {
        store.setStore({ account: { address: accounts[0] } })
        emitter.emit(CONNECTION_CONNECTED)
      })
    }

  }

  render() {
    return (
      <MuiThemeProvider theme={ createMuiTheme(interestTheme) }>
        <CssBaseline />
        <HttpsRedirect>
          <IpfsRouter>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
              alignItems: 'center',
              background: "#f9fafb"
            }}>
              <Switch>
                <Route exact path="/how-it-works" render={() => (window.location = "https://corbinpage.github.io/protekt-protocol-docs")} />
                <Route path="/contracts">
                  <Header />
                  <AllContracts />
                </Route>
                <Route path="/holdings">
                  <Header />
                  <Holdings />
                </Route>
                <Redirect to="/contracts" />
              </Switch>
              <Footer />
            </div>
          </IpfsRouter>
        </HttpsRedirect>
      </MuiThemeProvider>
    );
  }
}

export default App;
