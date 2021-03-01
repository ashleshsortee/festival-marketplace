import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import ReactNotification from 'react-notifications-component';
import Web3 from 'web3';
import Festival from './components/Festival';
import Purchase from './components/Purchase';
import MyTickets from './components/MyTickets';
import SecondaryMarket from './components/SecondaryMarket';

class App extends Component {

  constructor() {
    super();

    new Promise((resolve, reject) => {
      if (typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);
        window.ethereum.enable()
          .then(() => {
            resolve(
              new Web3(window.ethereum)
            );
          })
          .catch(e => {
            reject(e);
          });
        return;
      }
      if (typeof window.web3 !== 'undefined') {
        return resolve(
          new Web3(window.web3.currentProvider)
        );
      }
      resolve(new Web3('http://127.0.0.1:8545'));
    });

    window.ethereum.on('accountsChanged', function () {
      window.location.reload();
    });
  }

  render() {
    return (
      <Router>

        <div >
          <ReactNotification />
          <nav style={{ padding: '0px 30px 0px 30px' }}>
            <div class="nav-wrapper" >
              <a href="/buyTickets" class="brand-logo left">Festival Marketplace</a>
              <ul class="right hide-on-med-and-down 10" >
                <div>
                  <li> <Link to="/createFestival">Add Festival</Link> </li>
                  <li> <Link to="/buyTickets">Buy Tickets</Link> </li>
                  <li> <Link to="/market">Secondary Market</Link> </li>
                  <li> <Link to="/tickets">MyTickets</Link> </li>
                  <li >
                  </li>
                </div>

              </ul>
            </div>
          </nav>

          <Switch>
            <Route path="/createFestival" component={Festival} />
            <Route path="/buyTickets" component={Purchase} />
            <Route path="/market" component={SecondaryMarket} />
            <Route path="/tickets" component={MyTickets} />
          </Switch>
        </div>

      </Router >
    )
  }
}

export default App;
