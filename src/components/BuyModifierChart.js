import { useEffect, useState, useRef } from 'react'

import config from '../config.json'

// Import Assets
import close from '../assets/close.svg'
import { isDisabled } from '@testing-library/user-event/dist/utils';

const BuyModifierChart = ({ reverseAuction, usdcCoin, provider, setToggleBuyModifier }) => {
  const decimals = 10**6;
  
  const [isDisable, setIsDisable] = useState(false)
  const [hasSold, setHasSold] = useState(false)
  const [error, setError] = useState(null)

  const [commit, setCommit] = useState(false)
  const [allowanceUSDC, setAllowanceUSDC] = useState(null)


  const usdcAllowanceRef = useRef(null);

  const numberSelectedRef = useRef(null);
  const passwordRef = useRef(null);

  const commitRef = useRef(null);



  const handleSubmitAllowanceUSDC = async (event) => {
    event.preventDefault();
    const signer = await provider.getSigner()
    // console.log(config.ReverseAuction.address, usdcAllowanceRef.current.value)
    try {
      const tx = await usdcCoin.connect(signer).approve(config.ReverseAuction.address, usdcAllowanceRef.current.value)
      await tx.wait()
    }
    catch (error){
      console.log(error.reason)
    }
  }

  const handleSubmitCheckAllowanceUSDC = async (event) => {
    event.preventDefault();
    const signer = await provider.getSigner()
    const allowance = await usdcCoin.allowance(await signer.getAddress(), config.ReverseAuction.address)
    setAllowanceUSDC((allowance.toNumber()/decimals).toString() + " USDC")
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsDisable(true)
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    try{

      fetch('http://3.144.15.19:3002/buyModifier', {  // Enter your IP address here
        method: 'POST', 
        mode: 'cors', 
        headers: { 'Content-Type': 'application/json' , 'Access-Control-Allow-Origin': '*'},
        body: JSON.stringify({"address": address}), // body data type must match "Content-Type" header
        redirect: 'follow'
      }).then((response) => {
        setIsDisable(false)
      })

    }
    catch(error){
      setError(error.reason)
    }
  }

  return (
    <div className="create">
      <div className="create__form">

        <button onClick={() => setToggleBuyModifier(false)} className="occasion__close">
          <img src={close} alt="Close" />
        </button>

        <div className='allowance__create'>
        <form onSubmit={handleSubmitAllowanceUSDC}>
          <label>
            <p>Allowance Amount (To participate in an auction you need to have at least the same amount of the price) USDC:</p>
            <input ref={usdcAllowanceRef} type="number" />
          </label>
          <button type="submit">Submit</button>
        </form>

        <form onSubmit={handleSubmitCheckAllowanceUSDC}>
          <label>
            <p>Check allowance:</p>
          </label>
          <button type="submit">Submit</button>
          <p>{allowanceUSDC}</p>
        </form>
        <p>{commit}</p>
      </div>

      <div>
      <form onSubmit={handleSubmit}>
        <label>
          <p>Buy modifier:</p>
        </label>
        <img src='https://www.pngmart.com/files/8/Question-Mark-PNG-Transparent-Image.png' width={"300px"}/>
        <button type="submit" disabled={isDisable}>Submit</button>
        <p>{error}</p>
      </form>
      </div>
        
      </div>
    </div >
  );
}

export default BuyModifierChart;