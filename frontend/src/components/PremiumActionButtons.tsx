import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PremiumActionButtonsProps {
  onInviteFriends?: () => void;
}

const PremiumActionButtons: React.FC<PremiumActionButtonsProps> = ({ 
  onInviteFriends 
}) => {
  const navigate = useNavigate();

  const handleNewBet = () => {
    navigate('/bet');
  };

  const handleHistory = () => {
    navigate('/historia');
  };

  const handleOrders = () => {
    navigate('/ordens');
  };

  return (
    <div className="px-4 mt-6">
      <h3 className="text-golden text-lg font-semibold mb-4">Ações Rápidas</h3>
      
      {/* Botões Principais */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <button
          onClick={handleNewBet}
          className="bg-[#27c93f] hover:bg-[#22a835] text-white font-semibold py-4 px-3 rounded-lg transition-colors duration-200 flex flex-col items-center space-y-2"
        >
          <span className="text-2xl">🎯</span>
          <span className="text-sm">Nova Aposta</span>
        </button>

        <button
          onClick={handleHistory}
          className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white font-semibold py-4 px-3 rounded-lg transition-colors duration-200 flex flex-col items-center space-y-2"
        >
          <span className="text-2xl">📊</span>
          <span className="text-sm">Histórico</span>
        </button>

        <button
          onClick={handleOrders}
          className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white font-semibold py-4 px-3 rounded-lg transition-colors duration-200 flex flex-col items-center space-y-2"
        >
          <span className="text-2xl">📋</span>
          <span className="text-sm">Ordens</span>
        </button>
      </div>

      {/* Botão Convidar Amigos */}
      <button
        onClick={onInviteFriends}
        className="w-full bg-gradient-to-r from-golden to-yellow-600 hover:from-yellow-500 hover:to-golden text-black font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg"
      >
        <span className="text-2xl">👥</span>
        <span className="text-lg">Convidar Amigos</span>
        <span className="text-xl">💰</span>
      </button>
    </div>
  );
};

export default PremiumActionButtons;

