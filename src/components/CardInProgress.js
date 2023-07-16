import { useState, useEffect } from 'react'

const CardInProgess = ({ auction, setAuction, reverseAuction, signer, signerAddress, toggleModifiers, setToggleModifiers, 
                        toggleReveal, setToggleReveal, toggleClaim, setToggleClaim, toggleClaimAuctioneer, setToggleClaimAuctioneer }) => {
  
  const [normalSelectType, setNormalSelectType] = useState(null)
  const [normalRandomType, setNormalRandomType] = useState(null)
  const [modifiersSelectType, setModifiersSelectType] = useState(null)
  const [modifiersRandomType, setModifiersRandomType] = useState(null)

  var stageText;
  var startDate;
  var endDate;
  var isAuctioneer = false;

  const decimals = 10**6;
  const togglePop = () => {
    setAuction(auction)
    switch(stageText){
      case "Wait next Stage":
        break;
      case "Use Modifier":
        toggleModifiers ? setToggleModifiers(false) : setToggleModifiers(true)
        break;
      case "Reveal Bid":
        toggleReveal ? setToggleReveal(false) : setToggleReveal(true)
        break;
      case "Check Winner":
        toggleClaim ? setToggleClaim(false) : setToggleClaim(true)
        break;
    }
  }

  const toggleAuctioneerPop = () => {
    setAuction(auction)
    reverseAuction.connect(signer).claimAuctionProfits(auction.id);
  }

  reverseAuction.NORMAL_SELECT_TYPE().then((result)=>{setNormalSelectType(result)})
  reverseAuction.NORMAL_RANDOM_TYPE().then((result)=>{setNormalRandomType(result)})
  reverseAuction.MODIFIERS_SELECT_TYPE().then((result)=>{setModifiersSelectType(result)})
  reverseAuction.MODIFIERS_RANDOM_TYPE().then((result)=>{setModifiersRandomType(result)})
  const now = new Date();
  const epochNow = now.getTime()/1000;


  if(epochNow > auction.endTimeReveal.toNumber()){
    stageText = "Check Winner";
    startDate = new Date(auction.endTimeReveal.toNumber() * 1000).toLocaleString();
  }
  else if(((auction.typeA == modifiersSelectType || auction.typeA == modifiersRandomType) && auction.endTimeModifiers.toNumber() < epochNow) || 
  ((auction.typeA == normalSelectType || auction.typeA == normalRandomType) && auction.endTimeCommit.toNumber() < epochNow)){
    stageText = "Reveal Bid";
    startDate = new Date(auction.endTimeModifiers.toNumber() * 1000).toLocaleString();
    endDate = new Date(auction.endTimeReveal.toNumber() * 1000).toLocaleString();
  }
  else if((auction.typeA == modifiersSelectType || auction.typeA == modifiersRandomType) && auction.endTimeCommit.toNumber() < epochNow){
    stageText = "Use Modifier";
    startDate = new Date(auction.endTimeCommit.toNumber() * 1000).toLocaleString();
    endDate = new Date(auction.endTimeModifiers.toNumber() * 1000).toLocaleString();
  }
  else{
    stageText = "Wait next Stage";
    startDate = new Date(auction.startTime.toNumber() * 1000).toLocaleString();
    endDate = new Date(auction.endTimeCommit.toNumber() * 1000).toLocaleString();
  }

  if(auction.auctioneer == signerAddress){
    isAuctioneer = true;
  }



  return (
    <div className='card'>
      <div className='card__info'>
        <p className='card__date'>
          <strong>
            {startDate}
          </strong>
          <br />
          -{endDate}
        </p>

        <h3 className='card__name'>
          {auction.title}
        </h3>

        <p className='card__location'>
          <small>{auction.description}</small>
        </p>

        <button
            type="button"
            className='card__button'
            onClick={() => togglePop()}
          >
            {stageText}
        </button>

        {isAuctioneer && (
          <button
          type="button"
          className='card__button_left'
          onClick={() => toggleAuctioneerPop()}
          >
            Claim Profits
        </button>
        )}

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

export default CardInProgess;