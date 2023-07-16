import { useRef, useState, useEffect } from 'react'

// Import Assets
import close from '../assets/close.svg'

import config from '../config.json'

const CreateChart = ({ reverseAuction, usdcCoin, provider, setToggleCreate }) => {

  const decimals = 10**6;

  const [seatsTaken, setSeatsTaken] = useState(false)
  const [hasSold, setHasSold] = useState(false)

  const [normalSelectType, setNormalSelectType] = useState(null)
  const [normalRandomType, setNormalRandomType] = useState(null)
  const [modifiersSelectType, setModifiersSelectType] = useState(null)
  const [modifiersRandomType, setModifiersRandomType] = useState(null)
  const [inputModifier, setInputModifier] = useState(false)

  const [allowanceUSDC, setAllowanceUSDC] = useState(null)


  const usdcAllowanceRef = useRef(null);


  const typeAuctionRef = useRef(null);

  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const prizeRef = useRef(null);
  const entryPriceRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeCommitRef = useRef(null);
  const endTimeModifiersRef = useRef(null);
  const endTimeRevealRef = useRef(null);


  const loadData = async () => {
    setNormalSelectType(await reverseAuction.NORMAL_SELECT_TYPE())
    setNormalRandomType(await reverseAuction.NORMAL_RANDOM_TYPE())
    setModifiersSelectType(await reverseAuction.MODIFIERS_SELECT_TYPE())
    setModifiersRandomType(await reverseAuction.MODIFIERS_RANDOM_TYPE())

    reverseAuction.on("CreateAuction", async (owner, idAuction) => {
      console.log(owner, idAuction);
    });
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const signer = await provider.getSigner()

    const startTime = Math.floor((new Date(startTimeRef.current.value)).getTime() / 1000)
    const endTimeCommit = Math.floor((new Date(endTimeCommitRef.current.value)).getTime() / 1000)
    var endTimeModifiers;
    if(typeAuctionRef.current.value == modifiersRandomType || typeAuctionRef.current.value == modifiersSelectType){
      endTimeModifiers = Math.floor((new Date(endTimeModifiersRef.current.value)).getTime() / 1000)
      
    }
    else{
      endTimeModifiers = endTimeCommit
    }
    
    const endTimeReveal = Math.floor((new Date(endTimeRevealRef.current.value)).getTime() / 1000)

    

    const transaction = await reverseAuction.connect(signer).createAuction(
      titleRef.current.value,
      descriptionRef.current.value,
      prizeRef.current.value * decimals,
      entryPriceRef.current.value * decimals,
      startTime,
      endTimeCommit,
      endTimeModifiers,
      endTimeReveal,
      typeAuctionRef.current.value
    )

    await transaction.wait()

  }

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

  const handleChangeType = async (event) => {
    if(typeAuctionRef.current.value == normalSelectType || typeAuctionRef.current.value == normalRandomType){
      setInputModifier(false)
    }
    else{
      setInputModifier(true)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="create">
      <div className="create__form">
      <button onClick={() => setToggleCreate(false)} className="occasion__close">
          <img src={close} alt="Close" />
        </button>

      <div className='allowance__create'>
        <form onSubmit={handleSubmitAllowanceUSDC}>
          <label>
            <p>Allowance Amount (To create an auction you need to have at least the same amount of the prize) USDC:</p>
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

        

      </div>

      <div>
      <form onSubmit={handleSubmit}>
        <label>
          <p>Type Auction:</p>
          <select ref={typeAuctionRef} onChange={handleChangeType}>
            <option value={normalSelectType}>Normal select</option>
            <option value={normalRandomType}>Normal random</option>
            <option value={modifiersSelectType}>Modifiers select</option>
            <option value={modifiersRandomType}>Modifiers random</option>
          </select>
        </label>
        <label>
          <p>Title:</p>
          <input ref={titleRef} type="text" />
        </label>
        <label>
          <p>Description:</p>
          <input ref={descriptionRef} type="text" />
        </label>
        <label>
          <p>Prize Amount USDC:</p>
          <input ref={prizeRef} type="number" />
        </label>
        <label>
          <p>Entry Price Amount USDC:</p>
          <input ref={entryPriceRef} type="number" />
        </label>
        <label>
          <p>Start Time:</p>
          <input ref={startTimeRef} type="datetime-local" />
        </label>
        <label>
          <p>End Commit Time:</p>
          <input ref={endTimeCommitRef} type="datetime-local" />
        </label>
        {inputModifier &&
        <label>
          <p>End Modifier Time:</p>
          <input ref={endTimeModifiersRef} type="datetime-local" />
        </label>
        }
        <label>
          <p>End Reveal Time:</p>
          <input ref={endTimeRevealRef} type="datetime-local" />
        </label>
        <button type="submit">Submit</button>
      </form>
      </div>
      
      </div>
    </div >
  );
}

export default CreateChart;