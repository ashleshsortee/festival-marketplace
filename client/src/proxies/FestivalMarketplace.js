import Provider from './Provider';
import { festivalMarketplaceABI } from '../constants';

const provider = new Provider();

const FestivalMarketplace = (contractAddress) => {
  const web3 = provider.web3;

  return new web3.eth.Contract(festivalMarketplaceABI, contractAddress);
};

export default FestivalMarketplace;