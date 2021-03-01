import React, { Component } from 'react';
import Web3 from 'web3';
import festivalFactory from '../proxies/FestivalFactory';
import FestivalNFT from '../proxies/FestivalNFT';
import renderNotification from '../utils/notification-handler';

let web3;

class MyTickets extends Component {
  constructor() {
    super();

    this.state = {
      tickets: [],
      fests: [],
      ticket: null,
      fest: null,
      marketplace: null,
      price: null,
      test: null,
    };

    web3 = new Web3(window.ethereum);
  }

  async componentDidMount() {
    await this.updateFestivals();
  }

  onListForSale = async (e) => {
    try {
      e.preventDefault();
      const initiator = await web3.eth.getCoinbase();
      const { ticket, price, marketplace } = this.state;
      const nftInstance = await FestivalNFT(this.state.fest);
      await nftInstance.methods.setSaleDetails(ticket, web3.utils.toWei(price, 'ether'), marketplace).send({ from: initiator, gas: 6700000 });

      renderNotification('success', 'Success', `Ticket is listed for sale in secondary market!`);
    } catch (err) {
      console.log('Error while lisitng for sale', err);
      renderNotification('danger', 'Error', err.message.split(' ').slice(8).join(' '));
    }
  }

  updateFestivals = async () => {
    try {
      const initiator = await web3.eth.getCoinbase();
      const activeFests = await festivalFactory.methods.getActiveFests().call({ from: initiator });
      const festDetails = await festivalFactory.methods.getFestDetails(activeFests[0]).call({ from: initiator });
      const renderData = await Promise.all(activeFests.map(async (fest, i) => {
        const festDetails = await festivalFactory.methods.getFestDetails(activeFests[i]).call({ from: initiator });
        return (
          <option key={fest} value={fest} >{festDetails[0]}</option>
        )
      }));

      this.setState({ fests: renderData, fest: activeFests[0], marketplace: festDetails[4] });
      this.updateTickets();
    } catch (err) {
      renderNotification('danger', 'Error', 'Error while updating the fetivals');
      console.log('Error while updating the fetivals', err);
    }
  }

  updateTickets = async () => {
    try {
      const initiator = await web3.eth.getCoinbase();
      const nftInstance = await FestivalNFT(this.state.fest);
      const tickets = await nftInstance.methods.getTicketsOfCustomer(initiator).call({ from: initiator });
      const renderData = tickets.map((ticket, i) => (
        <option key={ticket} value={ticket} >{ticket}</option>
      ));

      this.setState({ tickets: renderData, ticket: tickets[0] });
    } catch (err) {
      renderNotification('danger', 'Error', 'Error in updating the ticket for festival');
      console.log('Error in updating the ticket', err);
    }
  }

  onFestivalChangeHandler = async (e) => {
    try {
      const state = this.state;
      state[e.target.name] = e.target.value;
      this.setState(state);

      const { fest } = this.state;
      await this.updateTickets(fest);

      const initiator = await web3.eth.getCoinbase();
      const festDetails = await festivalFactory.methods.getFestDetails(fest).call({ from: initiator });

      this.setState({ marketplace: festDetails[4] });
    } catch (err) {
      console.log('Error while tickets for festival', err.message);
      renderNotification('danger', 'Error', 'Error while tickets for festival');
    }
  }

  selectHandler = (e) => {
    this.setState({ ticket: e.target.value });
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
              <h5 style={{ padding: "30px 0px 0px 10px" }}>My Tickets</h5>
              <form class="" onSubmit={this.onListForSale}>

                <label class="left">Festival</label>
                <select className="browser-default" name='fest' value={this.state.fest || undefined} onChange={this.onFestivalChangeHandler}>
                  <option value="" disabled >Select Festival</option>
                  {this.state.fests}
                </select><br /><br />

                <label class="left">Ticket Id</label>
                <select className="browser-default" name='ticket' value={this.state.ticket || undefined} onChange={this.selectHandler}>
                  <option value="" disabled>Select Ticket</option>
                  {this.state.tickets}
                </select><br /><br />

                <label class="left">Sale Price</label><input id="price" placeholder="Sale Price" type="text" className="input-control" name="price" onChange={this.inputChangedHandler} /><br /><br />

                <button type="submit" className="custom-btn login-btn">List for Sale</button>
              </form>
            </div>
          </div>
        </div>
      </div >
    )
  }
}

export default MyTickets;  