import React from "react";

export default function Modifier({imageUrl, title, type, value, isForUse, background, modifierId, setModifierId, setModifierIdApprove }) {

    const handleUseMod = async () => {
        setModifierId(modifierId);
    }

    const handleApproveModSet = () => {
      setModifierIdApprove(modifierId)
    }

  return (
    <div className="cardModifier">
      <img style={{"backgroundColor": background}} className="product--image" src={imageUrl} alt="product image" />
      <h2>{title}</h2>
      <p className="price">{type}</p>
      <p>{value}</p>
      {isForUse &&
      <div>
        <p>
            <button 
            className="buttonModifier"
            onClick={() => handleApproveModSet()}
            >Approve</button>
        </p>
        <p>
            <button 
            className="buttonModifier"
            onClick={() => handleUseMod()}
            >Usar</button>
        </p>
    </div>
      }
      
    </div>
  );
}