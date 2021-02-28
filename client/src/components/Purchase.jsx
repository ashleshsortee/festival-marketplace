import React, { Component } from 'react';
import Web3 from 'web3';
import festivalFactory from '../proxies/FestivalFactory';
import FestivalNFT from '../proxies/FestivalNFT';
import FestivalMarketplace from '../proxies/FestivalMarketplace';
import festToken from '../proxies/FestToken';
import renderNotification from '../utils/notification-handler';

let web3;

class Purchase extends Component {
  constructor() {
    super();

    this.state = {
      festivals: [],
    };

    web3 = new Web3(window.ethereum);
  }

  async componentDidMount() {
    await this.updateFestivals();
  }

  updateFestivals = async () => {
    try {
      const initiator = await web3.eth.getCoinbase();
      const activeFests = await festivalFactory.methods.getActiveFests().call({ from: initiator });
      console.log('console result', activeFests);

      const fests = await Promise.all(activeFests.map(async fest => {
        const festDetails = await festivalFactory.methods.getFestDetails(fest).call({ from: initiator });
        const [festName, festSymbol, ticketPrice, totalSupply, marketplace] = Object.values(festDetails);
        const nftInstance = await FestivalNFT(fest);
        console.log('console fest');
        const saleId = await nftInstance.methods.getNextSaleTicketId().call({ from: initiator });
        console.log('console details', festName, ticketPrice, totalSupply, saleId);

        return (
          <tr key={fest}>
            <td class="center">{festName}</td>
            <td class="center">{web3.utils.fromWei(ticketPrice, 'ether')}</td>
            <td class="center">{totalSupply - saleId}</td>

            <td class="center"><button type="submit" className="custom-btn login-btn" onClick={this.onPurchaseTicket.bind(this, marketplace, ticketPrice, initiator)}>Buy</button></td>
          </tr>
        );
      }));

      this.setState({ festivals: fests });

    } catch (err) {
      renderNotification('danger', 'Error', err.message);
      console.log('Error while updating the fetivals', err);
    }
  }

  onPurchaseTicket = async (marketplace, ticketPrice, initiator) => {
    try {
      console.log('console marketPlace', marketplace);

      const marketplaceInstance = await FestivalMarketplace(marketplace);
      console.log('console marketPlaceInstance', marketplaceInstance);

      const approvalResult = await festToken.methods.approve(marketplace, ticketPrice).send({ from: initiator, gas: 6700000 });
      console.log('console approvalResult', approvalResult);

      const purchaseResult = await marketplaceInstance.methods.purchaseTicket().send({ from: initiator, gas: 6700000 });

      console.log('console purchaseResult', purchaseResult);

      await this.updateFestivals();

      renderNotification('success', 'Success', `Ticket for the Festival purchased successfully!`);

    } catch (err) {
      console.log('Error while creating new festival', err);
      renderNotification('danger', 'Error', err.message);
    }
  }

  inputChangedHandler = (e) => {
    const state = this.state;
    console.log('input', e.target.name, e.target.value)
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  render() {
    return (

      <div class="container " class="col s12 m6 offset-m3 l4 offset-l4 z-depth-6 card-panel">

        <h4 class="center">Purchase Tickets</h4>

        <table id='requests' class="responsive-table striped" >
          <thead>
            <tr>
              <th key='name' class="center">Name</th>
              <th key='price' class="center">Price(in FEST)</th>
              <th key='left' class="center">Tickets Left</th>
              <th key='purchase' class="center">Purchase</th>
            </tr>
          </thead>
          <tbody class="striped highlight">
            {this.state.festivals}
          </tbody>
        </table>

      </div >

    )
  }
}

export default Purchase;  