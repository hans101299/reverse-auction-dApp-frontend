import { ethers } from 'ethers'
import { Link } from "react-router-dom";

const Navigation = ({ account, setAccount, provider }) => {
  const networks = {
    goerli: {
      chainId: `0x${Number(5).toString(16)}`,
      chainName: "Goerli",
      nativeCurrency: {
        name: "Goerli Ether",
        symbol: "ETH",
        decimals: 18
      },
      rpcUrls: ["https://ethereum-goerli.publicnode.com"
      ],
      blockExplorerUrls: ["https://goerli.etherscan.io"]
    }
  };
  
  
  const changeNetwork = async () => {
    try {
      if (!window.ethereum) throw new Error("No crypto wallet found");
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            ...networks["goerli"]
          }
        ]
      });
    } catch (err) {
      console.log(err.message);
    }
  };

  const connectHandler = async () => {
    const { chainId } = await provider.getNetwork()
    if(chainId != "0x5"){
      await changeNetwork()
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)
  }

  return (
    <nav>
      <div className='nav__brand'>
        <h1>Reverse Auction Dapp</h1>
        
        <ul className='nav__links'>
          <li><Link to="/">Auctions</Link></li>
          <li><Link to="/myAuctions">My Auctions</Link></li>
          <li><Link to="/myModifiers">My Modifiers</Link></li>
        </ul>
      </div>

      {account ? (
        <button
          type="button"
          className='nav__connect'
        >
          {account.slice(0, 6) + '...' + account.slice(38, 42)}
        </button>
      ) : (
        <button
          type="button"
          className='nav__connect'
          onClick={connectHandler}
        >
          Connect
        </button>
      )}
    </nav>
  );
}

export default Navigation;