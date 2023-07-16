import { ethers } from 'ethers'

const Card = ({ auction, toggleParticipate, setToggleParticipate, setAuction }) => {

  const decimals = 10**6;
  const togglePop = () => {
    setAuction(auction)
    toggleParticipate ? setToggleParticipate(false) : setToggleParticipate(true)
  }

  return (
    <div className='card'>
      <div className='card__info'>
        <p className='card__date'>
          <strong>
            {(new Date(auction.startTime * 1000)).toLocaleString()}
          </strong>
          <br />
          -{(new Date(auction.endTimeCommit *1000)).toLocaleString()}
        </p>

        <h3 className='card__name'>
          {auction.title}
        </h3>

        <p className='card__location'>
          <small>{auction.description}</small>
        </p>

        <p className='card__cost'>
          <strong>
            {(auction.entryPrice.toNumber()/decimals).toString()}
          </strong>
          USDC
        </p>

        <button
            type="button"
            className='card__button'
            onClick={() => togglePop()}
          >
            Participate
        </button>

        {/* {occasion.tickets.toString() === "0" ? (
          <button
            type="button"
            className='card__button--out'
            disabled
          >
            Sold Out
          </button>
        ) : (
          <button
            type="button"
            className='card__button'
            onClick={() => togglePop()}
          >
            Participate
          </button>
        )} */}
      </div>

      <hr />
    </div >
  );
}

export default Card;