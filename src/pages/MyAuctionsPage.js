import React from 'react'

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

import Navigation from '../components/Navigation.js'
import CardInProgess from '../components/CardInProgress.js'
import ClaimChart from '../components/ClaimChart.js'
import UseModifierChart from '../components/UseModifierChart.js'
import RevealChart from '../components/RevealChart.js'

// ABIs
import ReverseAuction from '../abis/ReverseAuction.json'
import TicketReverseAuction from '../abis/TicketReverseAuction.json'
import ModifierReverseAuction from "../abis/ModifierReverseAuction.json"
import USDCCoin from "../abis/USDCoin.json"

// Config
import config from '../config.json'


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


function MyAuctionsPage() {
    const [provider, setProvider] = useState(null)
    const [account, setAccount] = useState(null)
    const [signerAddress, setSignerAddress] = useState(null)
    const [signer, setSigner] = useState(null)
  
    const [reverseAuction, setReverseAuction] = useState(null)
    const [ticketReverseAuction, setTicketReverseAuction] = useState(null)
    const [modifierReverseAuction, setModifierReverseAuction] = useState(null)
    const [usdcCoin, setUsdcCoin] = useState(null)
  
    const [auctions, setAuctions] = useState([])
  
    const [auction, setAuction] = useState({})
    const [toggleModifiers, setToggleModifiers] = useState(false)
    const [toggleReveal, setToggleReveal] = useState(false)
    const [toggleClaim, setToggleClaim] = useState(false)
    const [toggleClaimAuctioneer, setToggleClaimAuctioneer] = useState(false)
    const [toggleCreate, setToggleCreate] = useState(false)
    
  
  
    const loadBlockchainData = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)

      const signer = await provider.getSigner();
      setSigner(signer)

      const signerAddress = await provider.getSigner().getAddress()
      setSignerAddress(signerAddress);
  
      const network = await provider.getNetwork()
      const reverseAuction = new ethers.Contract(config.ReverseAuction.address, ReverseAuction.abi, provider)
      setReverseAuction(reverseAuction)
  
      const ticketReverseAuction = new ethers.Contract(config.TicketReverseAuction.address, TicketReverseAuction.abi, provider)
      setTicketReverseAuction(ticketReverseAuction)
  
      const modifierReverseAuction = new ethers.Contract(config.ModifierReverseAuction.address, ModifierReverseAuction.abi, provider)
      setModifierReverseAuction(modifierReverseAuction)
  
      const usdcCoin = new ethers.Contract(config.USDCCoin.address, USDCCoin.abi, provider)
      setUsdcCoin(usdcCoin)
  
      const res = await reverseAuction.connect(signer).getMyAuctionsPage(0,20);

      var totalAuctionIds = res[0];
      const auctions = []

      totalAuctionIds = [...new Set( totalAuctionIds.map(obj => obj.toNumber())) ];

  
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

    return(
    <div>
      <header>
        <Navigation account={account} setAccount={setAccount} provider={provider} />

        <h2 className="header__title"><strong>My Auctions</strong></h2>
      </header>

      {auctions.map((auction, index) => (
        <CardInProgess 
          auction={auction}
          setAuction={setAuction}
          id={index + 1}
          reverseAuction={reverseAuction}
          signer={signer}
          signerAddress={signerAddress}
          account={account}
          toggleModifiers={toggleModifiers}
          setToggleModifiers = {setToggleModifiers}
          toggleReveal = {toggleReveal}
          setToggleReveal = {setToggleReveal}
          toggleClaim = {toggleClaim}
          setToggleClaim = {setToggleClaim}
          toggleClaimAuctioneer ={toggleClaimAuctioneer}
          setToggleClaimAuctioneer = {setToggleClaimAuctioneer}
          key={index}
        />
      ))}

      {toggleClaim && (
        <ClaimChart
          auction = {auction}
          reverseAuction = {reverseAuction}
          provider = {provider}
          setToggleClaim = {setToggleClaim}
        />
      )
      }

      {toggleModifiers && (
        <UseModifierChart
          auction={auction}
          reverseAuction = {reverseAuction}
          modifierReverseAuction={modifierReverseAuction}
          provider={provider}
          setToggleModifiers={setToggleModifiers}
        />
      )}
      {toggleReveal && (
        <RevealChart
          auction={auction}
          reverseAuction = {reverseAuction}
          provider={provider}
          setToggleReveal={setToggleReveal}
        />
      )}
      
    </div>
    )
}

export default MyAuctionsPage