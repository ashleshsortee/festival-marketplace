import React, { Component } from 'react';
import Web3 from 'web3';
import festivalFactory from '../proxies/FestivalFactory';
import festToken from '../proxies/FestToken';
import FestivalNFT from '../proxies/FestivalNFT';
import renderNotification from '../utils/notification-handler';

let web3;

class Festival extends Component {
  constructor() {
    super();

    this.state = {
      name: null,
      symbol: null,
      price: null,
      suppply: null,
    };

    web3 = new Web3(window.ethereum);
  }

  onCreateFestival = async (e) => {
    try {
      e.preventDefault();

      const organiser = await web3.eth.getCoinbase();
      const { name, symbol, price, supply } = this.state;
      const { events: { Created: { returnValues: { ntfAddress, marketplaceAddress } } } } = await festivalFactory.methods.createNewFest(
        festToken._address,
        name,
        symbol,
        web3.utils.toWei(price, 'ether'),
        supply
      ).send({ from: organiser, gas: 6700000 });

      renderNotification('success', 'Success', `Festival Created Successfully!`);

      const nftInstance = await FestivalNFT(ntfAddress);
      const batches = Math.ceil(supply / 30);
      let batchSupply = 30;
      let curCount = 0
      let prevCount = 0

      if (supply < 30) {
        const res = await nftInstance.methods.bulkMintTickets(supply, marketplaceAddress).send({ from: organiser, gas: 6700000 });
      } else {
        for (let i = 0; i < batches; i++) {
          prevCount = curCount;
          curCount += 30;
          if (supply < curCount) {
            batchSupply = supply - prevCount;
          }
          const res = await nftInstance.methods.bulkMintTickets(batchSupply, marketplaceAddress).send({ from: organiser, gas: 6700000 });
        }
      }
    } catch (err) {
      console.log('Error while creating new festival', err);
      renderNotification('danger', 'Error', `${err.message}`);
    }
  }

  inputChangedHandler = (e) => {
    const state = this.state;
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  render() {
    return (
      <div class="container center" >
        <div class="row">
          <div class="container ">
            <div class="container ">
              <h5 style={{ padding: "30px 0px 0px 10px" }}>Create new Festival</h5>
              <form class="" onSubmit={this.onCreateFestival}>
                <label class="left">Fest Name</label><input id="name" class="validate" placeholder="Fest Name" type="text" class="validate" name="name" onChange={this.inputChangedHandler} /><br /><br />
                <label class="left">Fest Symbol</label><input id="symbol" class="validate" placeholder="Fest Symbol" type="text" className="input-control" name="symbol" onChange={this.inputChangedHandler} /><br /><br />
                <label class="left">Ticket Price</label><input id="price" placeholder="Ticket Price" type="text" className="input-control" name="price" onChange={this.inputChangedHandler} /><br /><br />
                <label class="left">Total Supply</label><input id="supply" placeholder="Total SUpply" type="text" className="input-control" name="supply" onChange={this.inputChangedHandler}></input><br /><br />

                <button type="submit" className="custom-btn login-btn">Create Festival</button>
              </form>
            </div>
          </div>
        </div>
      </div >
    )
  }
}

export default Festival;
