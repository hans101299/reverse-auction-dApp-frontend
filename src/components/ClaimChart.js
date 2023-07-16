import { useEffect, useState, useRef } from 'react'

import config from '../config.json'

// Import Assets
import close from '../assets/close.svg'

const ClaimChart = ({ auction, reverseAuction, ticketReverseAuction, provider, setToggleClaim }) => {
  const decimals = 10**6;
  
  const [seatsTaken, setSeatsTaken] = useState(false)
  const [hasSold, setHasSold] = useState(false)
  const [error, setError] = useState(null)

  const [commit, setCommit] = useState(false)
  const [winnerNumber, setWinnerNumber] = useState(null)

  const [ticketIds, setTicketIds] = useState([])

  const usdcAllowanceRef = useRef(null);

  const numberSelectedRef = useRef(null);
  const passwordRef = useRef(null);

  const selectTickettRef = useRef(null);


  const loadBlockchainData = async () => {
    const tickets = []
    const signer = await provider.getSigner()
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


  const handleSubmitChekWinner = async (event) => {
    event.preventDefault();
    const winnerNumber = await reverseAuction.checkWinner(auction.id);
    setWinnerNumber("Winner Number:" + winnerNumber.toNumber().toString())
  }

  const handleSubmitCreateCommit = async (event) => {
    event.preventDefault();
    const commit =await reverseAuction.createCommitment(numberSelectedRef.current.value,passwordRef.current.value)
    setCommit(commit);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const signer = await provider.getSigner()
    try{
      const transaction = await reverseAuction.connect(signer).claimAuctionPrize(auction.id, parseInt(selectTickettRef.current.value))
    }
    catch(error){
      setError(error.reason)
    }
  }

  return (
    <div className="create">
      <div className="create__form">
        {/* <h1>Participate in Auction :{auction.title}</h1> */}

        <button onClick={() => setToggleClaim(false)} className="occasion__close">
          <img src={close} alt="Close" />
        </button>

        <div className='allowance__create'>
        <form onSubmit={handleSubmitChekWinner}>
          <label>
            <p>Check the winner number:</p>
          </label>
          <button type="submit">Submit</button>
        </form>
        <p>{winnerNumber}</p>

      </div>

      <div>
      <form onSubmit={handleSubmit}>
        <label>
          <p>Claim Prize:</p>
        </label>
        <select name="SelectTicket" ref={selectTickettRef}>
          {ticketIds.map((ticket, index) => (
            <option value={ticket[0]} key={index}>Ticket:{ticket[0]}-Number:{ticket[1]}</option>
          ))}
        </select>
        <button type="submit">Submit</button>
        <p>{error}</p>
      </form>
      </div>
        
      </div>
    </div >
  );
}

export default ClaimChart;