import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ActionButtonsProps {
  onNewBetClick?: () => void;
  onHistoryClick?: () => void;
  onExploreCryptosClick: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onNewBetClick,
  onHistoryClick,
  onExploreCryptosClick,
}) => {
  const navigate = useNavigate();
  
  const handleNewBetClick = () => {
    if (onNewBetClick) {
      onNewBetClick();
    } else {
      navigate('/bet');
    }
  };

  const handleHistoryClick = () => {
    if (onHistoryClick) {
      onHistoryClick();
    } else {
      navigate('/historia');
    }
  };

  const buttonClass = "w-full bg-black text-golden font-bold py-3 rounded-lg mb-3 shadow-lg";

  return (
    <div className="px-4 mt-4">
      <button className={buttonClass} onClick={handleNewBetClick}>
        NOVA APOSTA
      </button>
      <button className={buttonClass} onClick={handleHistoryClick}>
        HISTÓRICO
      </button>
      <button className={buttonClass} onClick={onExploreCryptosClick}>
        EXPLORAR CRIPTOS
      </button>
    </div>
  );
};

export default ActionButtons;
