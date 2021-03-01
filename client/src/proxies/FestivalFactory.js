import Provider from './Provider';
import FestivalFactoryABI from '../abi/contracts/FestiveTicketsFactory.json';

const provider = new Provider();

class FestivalFactory {
  constructor() {
    const web3 = provider.web3;
    const deploymentKey = Object.keys(FestivalFactoryABI.networks)[0];

    this.instance = new web3.eth.Contract(
      FestivalFactoryABI.abi,
      FestivalFactoryABI.networks[deploymentKey].address,
    );
  }

  getInstance = () => this.instance;
}

const festivalFactory = new FestivalFactory();
Object.freeze(festivalFactory);

export default festivalFactory.getInstance();