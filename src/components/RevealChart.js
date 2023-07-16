import { useEffect, useState, useRef } from 'react'

import config from '../config.json'

// Import Assets
import close from '../assets/close.svg'

const RevealChart = ({ auction, reverseAuction, provider, setToggleReveal }) => {
  const decimals = 10**6;
  
  const [number, setNumber] = useState(false)
  const [hasSold, setHasSold] = useState(false)
  const [error, setError] = useState(null)

  const [ticketIds, setTicketIds] = useState([])

  const selectTickettRef = useRef(null);

  const usdcAllowanceRef = useRef(null);
  const selectTicketNumberRef = useRef(null);

  const numberSelectedRef = useRef(null);
  const passwordRef = useRef(null);

  const commitRef = useRef(null);


  const loadBlockchainData = async () => {

    const signer = await provider.getSigner()
    const tickets = []

    const res = await reverseAuction.connect(signer).getMyBidsInAuction(auction.id);

    for(const id of res){
      const ticketId = id.toNumber();
      const number = await reverseAuction.ticketToNumber(ticketId);
      tickets.push([ticketId, number.toNumber()]);
    }

    setTicketIds(tickets);
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])


  const handleSubmitRevealCommit = async (event) => {
    event.preventDefault();
    const signer = await provider.getSigner()
    try{
      const transaction = await reverseAuction.connect(signer).revealAuction(auction.id, parseInt(selectTickettRef.current.value), numberSelectedRef.current.value, passwordRef.current.value)
    }
    catch(error){
      setError(error.reason)
    }
  }

  function convertToDecimal(number) {
    return (number / 10).toFixed(1);
  }

  const handleSubmitCheckNumber = async (event) => {
    event.preventDefault();
    var number = await reverseAuction.ticketToNumber(parseInt(selectTicketNumberRef.current.value));
    number = convertToDecimal(number.toNumber())
    setNumber(number)
  }

  return (
    <div className="create">
      <div className="create__form">
        {/* <h1>Participate in Auction :{auction.title}</h1> */}

        <button onClick={() => setToggleReveal(false)} className="occasion__close">
          <img src={close} alt="Close" />
        </button>

        <div className='allowance__create'>
          <form onSubmit={handleSubmitRevealCommit}>
          <p>Reveal your secret commit:</p>
            <select name="SelectTicket" ref={selectTickettRef}>
              {ticketIds.map((ticket, index) => (
                <option value={ticket[0]} key={index}>Ticket:{ticket[0]}</option>
              ))}
            </select>
            <label>
              <p>Put your number:</p>
              <input ref={numberSelectedRef} type="number" />
            </label>
            <label>
              <p>Write your password:</p>
              <input ref={passwordRef} type="password" />
            </label>
            <button type="submit">Submit</button>
            
          </form>
          <p>{error}</p>
        </div>
        
        <div>
          <form onSubmit={handleSubmitCheckNumber}>
            <p>Check your number after reveal:</p>
              <select name="SelectTicket" ref={selectTicketNumberRef}>
                {ticketIds.map((ticket, index) => (
                  <option value={ticket[0]} key={index}>Ticket:{ticket[0]}</option>
                ))}
              </select>
              <button type="submit">Submit</button>
            
          </form>
          <p>{number}</p>
        </div>
      </div>
    </div >
  );
}

export default RevealChart;