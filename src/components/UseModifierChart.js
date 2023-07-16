import { useEffect, useState, useRef } from 'react'

import Modifier from './Modifier'
import Carousel from 'react-multi-carousel'

import config from '../config.json'

// Import Assets
import close from '../assets/close.svg'


export const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 1024 },
    items: 5,
    slidesToSlide: 2,
  },
  desktop: {
    breakpoint: { max: 1024, min: 800 },
    items: 4,
  },
  tablet: {
    breakpoint: { max: 800, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

const UseModifierChart = ({ auction, reverseAuction, modifierReverseAuction, usdcCoin, provider, setToggleModifiers }) => {
  const decimals = 10**6;
  
  const [modifierId, setModifierId] = useState(null)
  const [modifierIdApprove, setModifierIdApprove] = useState(null)
  const [error, setError] = useState(null)

  const [commit, setCommit] = useState(false)
  const [allowanceUSDC, setAllowanceUSDC] = useState(null)

  const [modifiers, setModifiers] = useState([])
  const [ticketIds, setTicketIds] = useState([])

  const selectTickettRef = useRef(null);
  
  const usdcAllowanceRef = useRef(null);

  const numberSelectedRef = useRef(null);
  const passwordRef = useRef(null);

  const commitRef = useRef(null);

  const loadBlockchainData = async () => {

    const signer = await provider.getSigner()

    const totalModifiersIds = await modifierReverseAuction.connect(signer).getMyModifiers();
    const modifiers = []

    for(const id of totalModifiersIds){
      var modifierURI = await modifierReverseAuction.tokenURI(id);
      modifierURI = modifierURI.replace("ipfs://", "https://ipfs.io/ipfs/");
      var response = await fetch(modifierURI)
      var modifier = await response.json();
      modifier.modifierId = id;
      modifiers.push(modifier)
    }

    setModifiers(modifiers)

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

  const handleUse = async () => {
    const signer = await provider.getSigner()
    try{
      await reverseAuction.connect(signer).useModifier(auction.id, modifierId, parseInt(selectTickettRef.current.value));
    }
    catch(error){
      setError(error.reason)
    }
  }

  useEffect(() => {
    if (modifierId !== null) {
      handleUse();
    }
  }, [modifierId]);

  useEffect(() => {
    if (modifierIdApprove !== null) {
      handleApproveMod();
    }
  }, [modifierIdApprove]);

  const handleApproveMod = async() => {
    const signer = await provider.getSigner()
    console.log(reverseAuction.address, modifierIdApprove)
    try{
      await modifierReverseAuction.connect(signer).approve(reverseAuction.address, modifierIdApprove)
    }
    catch(error){
      setError(error.reason)
    }
  }

  return (
    <div className="create">
      <div className="create__form_modifier">

      <button onClick={() => setToggleModifiers(false)} className="occasion__close">
          <img src={close} alt="Close" />
        </button>
        <div>
        <select name="SelectTicket" ref={selectTickettRef}>
          {ticketIds.map((ticket, index) => (
            <option value={ticket[0]} key={index}>Ticket:{ticket[0]}</option>
          ))}
        </select>

        {modifiers.length > 0 && <Carousel
          swipeable={false}
          draggable={false}
          showDots={true}
          responsive={responsive}
          ssr={true} // means to render carousel on server-side.
          infinite={true}
          keyBoardControl={true}
          customTransition="all .5"
          transitionDuration={500}
          containerClass="carousel-container"
          removeArrowOnDeviceType={["tablet", "mobile"]}
          dotListClass="custom-dot-list-style"
          itemClass="carousel-item-padding-40-px"
        >

          {modifiers.map((modifier, index) => (
            <Modifier 
              imageUrl = {modifier.image}
              title = {modifier.name}
              type = {modifier.attributes[0].value}
              value = {modifier.attributes[1].value.toString()}
              isForUse = {true}
              background = {"#" + modifier.background_color}
              modifierId = {modifier.modifierId}
              setModifierId = {setModifierId}
              setModifierIdApprove = {setModifierIdApprove}
              key={index}
            />
          ))}
        </Carousel>}

        <p>{error}</p>
        </div>
      </div>
    </div >
  );
}

export default UseModifierChart;