import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation.js'
import Card from './components/Card.js'
import ParticipateChart from './components/ParticipateChart.js'
import CreateChart from './components/CreateChart.js'

// ABIs
import ReverseAuction from './abis/ReverseAuction.json'
import TicketReverseAuction from './abis/TicketReverseAuction.json'
import ModifierReverseAuction from "./abis/ModifierReverseAuction.json"
import USDCCoin from "./abis/USDCoin.json"

// Config
import config from './config.json'

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

function App() {
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)

  const [reverseAuction, setReverseAuction] = useState(null)
  const [ticketReverseAuction, setTicketReverseAuction] = useState(null)
  const [modifierReverseAuction, setModifierReverseAuction] = useState(null)
  const [usdcCoin, setUsdcCoin] = useState(null)

  const [auctions, setAuctions] = useState([])

  const [auction, setAuction] = useState({})
  const [toggleParticipate, setToggleParticipate] = useState(false)
  const [toggleCreate, setToggleCreate] = useState(false)


  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()
    const reverseAuction = new ethers.Contract(config.ReverseAuction.address, ReverseAuction.abi, provider)
    setReverseAuction(reverseAuction)

    const ticketReverseAuction = new ethers.Contract(config.TicketReverseAuction.address, TicketReverseAuction.abi, provider)
    setTicketReverseAuction(ticketReverseAuction)

    const modifierReverseAuction = new ethers.Contract(config.ModifierReverseAuction.address, ModifierReverseAuction.abi, provider)
    setModifierReverseAuction(modifierReverseAuction)

    const usdcCoin = new ethers.Contract(config.USDCCoin.address, USDCCoin.abi, provider)
    setUsdcCoin(usdcCoin)

    const res = await reverseAuction.getAuctionsPage(0,20);

    const totalAuctionIds = res[0];
    const auctions = []

    for(const id of totalAuctionIds){
      const auction = await reverseAuction.getAuction(id)
      auctions.push(auction)
    }

    setAuctions(auctions)

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account)
    })

    window.ethereum.on('chainChanged', async (chainId) => {
      if(chainId != "0x5"){
        setTimeout(function(){
        }, 3000);
        await changeNetwork()
      }
    })
  }


  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>
      <header>
        <Navigation account={account} setAccount={setAccount} provider={provider} />

        <h2 className="header__title"><strong>Auctions in commit phase</strong></h2>
      </header>

      <button
        type="button"
        className='create__button'
        onClick={() => {
          setToggleCreate(true)
        }}
      >
        + Create Auction
      </button>

      <div className='cards'>
        {auctions.map((auction, index) => (
          <Card
            auction={auction}
            id={index + 1}
            reverseAuction={reverseAuction}
            provider={provider}
            account={account}
            toggleParticipate={toggleParticipate}
            setToggleParticipate={setToggleParticipate}
            setAuction={setAuction}
            key={index}
          />
        ))}
      </div>


      {toggleParticipate && (
        <ParticipateChart
          auction={auction}
          reverseAuction={reverseAuction}
          usdcCoin={usdcCoin}
          provider={provider}
          setToggleParticipate={setToggleParticipate}
        />
      )}

      {toggleCreate && (
        <CreateChart
          reverseAuction={reverseAuction}
          usdcCoin={usdcCoin}
          provider={provider}
          setToggleCreate = {setToggleCreate}
          auctions = {auctions}
          setAuctions = {setAuctions}
        />
      )}
    </div>
  );
}

export default App;