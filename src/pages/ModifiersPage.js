import React from 'react'

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import Modifier from '../components/Modifier.js';
import BuyModifierChart from '../components/BuyModifierChart.js';

import Navigation from '../components/Navigation.js'

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
  


  export default function ModifiersPage() {
    const [provider, setProvider] = useState(null)
    const [account, setAccount] = useState(null)
    const [signer, setSigner] = useState(null)
  
    const [reverseAuction, setReverseAuction] = useState(null)
    const [ticketReverseAuction, setTicketReverseAuction] = useState(null)
    const [modifierReverseAuction, setModifierReverseAuction] = useState(null)
    const [usdcCoin, setUsdcCoin] = useState(null)
  
    const [modifiers, setModifiers] = useState([])
  
    const [auction, setAuction] = useState({})
    const [toggleParticipate, setToggleParticipate] = useState(false)
    const [toggleBuyModifier, setToggleBuyModifier] = useState(false)
  
  
    const loadBlockchainData = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)

      const signer = await provider.getSigner().getAddress()
      setSigner(signer);
  
      const network = await provider.getNetwork()
      const reverseAuction = new ethers.Contract(config.ReverseAuction.address, ReverseAuction.abi, provider)
      setReverseAuction(reverseAuction)
  
      const ticketReverseAuction = new ethers.Contract(config.TicketReverseAuction.address, TicketReverseAuction.abi, provider)
      setTicketReverseAuction(ticketReverseAuction)
  
      const modifierReverseAuction = new ethers.Contract(config.ModifierReverseAuction.address, ModifierReverseAuction.abi, provider)
      setModifierReverseAuction(modifierReverseAuction)
  
      const usdcCoin = new ethers.Contract(config.USDCCoin.address, USDCCoin.abi, provider)
      setUsdcCoin(usdcCoin)
  
      const totalModifiersIds = await modifierReverseAuction.connect(signer).getMyModifiers();
      const modifiers = []
  
      for(const id of totalModifiersIds){
        var modifierURI = await modifierReverseAuction.tokenURI(id);
        modifierURI = modifierURI.replace("ipfs://", "https://ipfs.io/ipfs/");
        var response = await fetch(modifierURI)
        var modifier = await response.json();
        modifiers.push(modifier)
      }

      console.log(modifiers)
  
      setModifiers(modifiers)
  
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

        <h2 className="header__title"><strong>My Modifiers</strong></h2>
      </header>

      <button
        type="button"
        className='create__button'
        onClick={() => {
          setToggleBuyModifier(true)
        }}
      >
        Buy Modifier
      </button>

      {toggleBuyModifier && (
        <BuyModifierChart
          reverseAuction={reverseAuction}
          usdcCoin={usdcCoin}
          provider={provider}
          setToggleBuyModifier = {setToggleBuyModifier}
        />
      )}
      
      <div className='myModifiersContainer'>

        {modifiers.map((modifier, index) => (
          <Modifier 
            imageUrl = {modifier.image}
            title = {modifier.name}
            type = {modifier.attributes[0].value}
            value = {modifier.attributes[1].value.toString()}
            isForUse = {false}
            background = {"#" + modifier.background_color}
          />
        ))}

      </div>
      
    </div>
    )
}

//  ModifiersPage