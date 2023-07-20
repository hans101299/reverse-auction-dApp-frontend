import { useEffect, useState, useRef } from 'react'

import config from '../config.json'

// Import Assets
import close from '../assets/close.svg'

const ParticipateChart = ({ auction, reverseAuction, usdcCoin, provider, setToggleParticipate }) => {
  const decimals = 10**6;
  
  const [numberSelected, setNumberSelected] = useState(null)
  const [hasSold, setHasSold] = useState(false)
  const [error, setError] = useState(null)

  const [commit, setCommit] = useState(false)
  const [allowanceUSDC, setAllowanceUSDC] = useState(null)


  const usdcAllowanceRef = useRef(null);

  const numberSelectedRef = useRef(null);
  const passwordRef = useRef(null);

  const commitRef = useRef(null);

  const [normalSelectType, setNormalSelectType] = useState(null)
  const [normalRandomType, setNormalRandomType] = useState(null)
  const [modifiersSelectType, setModifiersSelectType] = useState(null)
  const [modifiersRandomType, setModifiersRandomType] = useState(null)

  reverseAuction.NORMAL_SELECT_TYPE().then((result)=>{setNormalSelectType(result)})
  reverseAuction.NORMAL_RANDOM_TYPE().then((result)=>{setNormalRandomType(result)})
  reverseAuction.MODIFIERS_SELECT_TYPE().then((result)=>{setModifiersSelectType(result)})
  reverseAuction.MODIFIERS_RANDOM_TYPE().then((result)=>{setModifiersRandomType(result)})


  const isSelect = auction.typeA == normalSelectType || auction.typeA == modifiersSelectType;

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

  const handleSubmitCreateCommit = async (event) => {
    event.preventDefault();
    const commit =await reverseAuction.createCommitment(numberSelectedRef.current.value,passwordRef.current.value)
    setCommit(commit);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const signer = await provider.getSigner()
    const address = await signer.getAddress()

    if(auction.typeA == normalSelectType || auction.typeA == modifiersSelectType){
      try{
        const transaction = await reverseAuction.connect(signer).participateSelectAuction(commitRef.current.value, auction.id)
      }
      catch(error){
        setError(error.reason)
      }
    }
    else{
      try{

        var response = await fetch('http://52.15.146.10:3002/participateRandom', {  // Enter your IP address here
          method: 'POST', 
          mode: 'cors', 
          headers: { 'Content-Type': 'application/json' , 'Access-Control-Allow-Origin': '*'},
          body: JSON.stringify({"address": address, "password" : commitRef.current.value, "auction": auction.id.toNumber()}),
          redirect: 'follow'
        })

        var responseJson = await response.json();
        setNumberSelected(responseJson.number);
  
      }
      catch(error){
        setError(error.reason)
      }
    }
    
  }

  return (
    <div className="create">
      <div className="create__form">
        {/* <h1>Participate in Auction :{auction.title}</h1> */}

        <button onClick={() => setToggleParticipate(false)} className="occasion__close">
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
        {isSelect && 
        <div>
        <form onSubmit={handleSubmitCreateCommit}>
        <p>Create your secret commit:</p>
          <label>
            <p>Select your number:</p>
            <input ref={numberSelectedRef} type="number" />
          </label>
          <label>
            <p>Write your password:</p>
            <input ref={passwordRef} type="password" />
          </label>
          <button type="submit">Submit</button>
          
        </form>
        <p>{commit}</p>
        </div>
      }
      </div>

      {isSelect && <div>
      <form onSubmit={handleSubmit}>
        <label>
            <p>Put your commit:</p>
            <input ref={commitRef} type="text" />
          </label>
        <button type="submit">Submit</button>
        <p>{error}</p>
      </form>
      </div>}

      {!isSelect && (
        <form onSubmit={handleSubmit}>
        <label>
            <p>Put your password:</p>
            <input ref={commitRef} type="text" />
          </label>
        <button type="submit">Submit</button>
        <p>{numberSelected}</p>
        <p>{error}</p>
      </form>
      )}
        
      </div>
    </div >
  );
}

export default ParticipateChart;