import React, { Component } from 'react';
import Web3 from 'web3';
import festivalFactory from '../proxies/FestivalFactory';
import FestivalNFT from '../proxies/FestivalNFT';
import FestivalMarketplace from '../proxies/FestivalMarketplace';
import festToken from '../proxies/FestToken';
import renderNotification from '../utils/notification-handler';

let web3;

class SecondaryMarket extends Component {
  constructor() {
    super();

    this.state = {
      tickets: [],
      fests: [],
      ticket: null,
      fest: null,
      marketplace: null,
      price: null,
      renderTickets: [],
    };

    web3 = new Web3(window.ethereum);
  }

  async componentDidMount() {
    await this.updateFestivals();
    if (this.state.fest) {
      await this.updateTickets()
    }
  }


  updateTickets = async () => {
    try {
      const { fest, festName } = this.state;
      const initiator = await web3.eth.getCoinbase();
      const nftInstance = await FestivalNFT(this.state.fest);
      const saleTickets = await nftInstance.methods.getTicketsForSale().call({ from: initiator });

      const renderData = await Promise.all(saleTickets.map(async ticketId => {
        const { purchasePrice, sellingPrice, forSale } = await nftInstance.methods.getTicketDetails(ticketId).call({ from: initiator });
        console.log('console details', { purchasePrice, sellingPrice, forSale });

        if (forSale) {
          console.log('console selling price', ticketId);
          return (
            <tr key={ticketId}>
              <td class="center">{festName}</td>
              <td class="center">{ticketId}</td>
              <td class="center">{web3.utils.fromWei(sellingPrice, 'ether')}</td>

              <td class="center"><button type="submit" className="custom-btn login-btn" onClick={this.onPurchaseTicket.bind(this, ticketId, sellingPrice, initiator)}>Buy</button></td>
            </tr>
          );
        }

      }));

      console.log('console renderData', renderData);
      this.setState({ renderTickets: renderData });


    } catch (err) {
      renderNotification('danger', 'Error', 'Error wile updating sale tickets');
      console.log('Error wile updating sale tickets', err);
    }
  }

  onPurchaseTicket = async (ticketId, sellingPrice, initiator) => {
    try {
      const { marketplace } = this.state;
      const marketplaceInstance = await FestivalMarketplace(marketplace);
      console.log('console sellingPrice', sellingPrice);
      const approvalResult = await festToken.methods.approve(marketplace, sellingPrice).send({ from: initiator, gas: 6700000 });
      console.log('console approvalResult', approvalResult);


      const purchaseResult = await marketplaceInstance.methods.secondaryPurchase(ticketId).send({ from: initiator, gas: 6700000 });
      console.log('console purchaseResult', purchaseResult);

      await this.updateTickets()

      renderNotification('success', 'Success', 'Ticket purchased for the festival successfully!');
    } catch (err) {
      renderNotification('danger', 'Error', err.message);
      console.log('Error while purchasing the ticket', err);
    }
  }


  updateFestivals = async () => {
    try {
      const initiator = await web3.eth.getCoinbase();
      const activeFests = await festivalFactory.methods.getActiveFests().call({ from: initiator });
      const festDetails = await festivalFactory.methods.getFestDetails(activeFests[0]).call({ from: initiator });
      const renderData = activeFests.map((fest, i) => (
        <option key={fest} value={fest} >{festDetails[0]}</option>
      ));
      this.setState({ fests: renderData, fest: activeFests[0], marketplace: festDetails[4], festName: festDetails[0] });

    } catch (err) {
      renderNotification('danger', 'Error', 'Error while updating the fetivals');
      console.log('Error while updating the fetivals', err);
    }
  }


  onFestivalChangeHandler = async (e) => {
    const state = this.state;
    state[e.target.name] = e.target.value;
    this.setState(state);

    const { fest } = this.state;

    const initiator = await web3.eth.getCoinbase();
    const festDetails = await festivalFactory.methods.getFestDetails(fest).call({ from: initiator });
    console.log('console marketPlace', festDetails);
    this.setState({ marketplace: festDetails[4] });
    await this.updateTickets();
  }

  inputChangedHandler = (e) => {
    const state = this.state;
    console.log('input', e.target.name, e.target.value)
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  render() {
    return (

      <div class="container center" >

        <div class="row">
          <div class="container ">

            <div class="container ">
              <h5 style={{ padding: "30px 0px 0px 10px" }}>Secondary Marketplace</h5>

              <label class="left">Festival</label>
              <select className="browser-default" name='fest' value={this.state.fest || undefined} onChange={this.onFestivalChangeHandler}>
                <option value="" disabled >Select Festival</option>
                {this.state.fests}
              </select><br /><br />


              <h4 class="center">Purchase Tickets</h4>

              <table id='requests' class="responsive-table striped" >
                <thead>
                  <tr>
                    <th key='name' class="center">Fest Name</th>
                    <th key='ticketId' class="center">Ticket Id</th>
                    <th key='cost' class="center">Cost(in FEST)</th>
                    <th key='purchase' class="center">Purchase</th>
                  </tr>
                </thead>
                <tbody class="striped highlight">
                  {this.state.renderTickets}
                </tbody>
              </table>



            </div>
          </div>
        </div>
      </div >

    )
  }
}

export default SecondaryMarket;  