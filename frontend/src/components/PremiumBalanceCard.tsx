import React from 'react';

interface PremiumBalanceCardProps {
  balance: string;
  pnl: string;
  isPositivePnl: boolean;
  onDeposit?: () => void;
  onWithdraw?: () => void;
}

const PremiumBalanceCard: React.FC<PremiumBalanceCardProps> = ({ 
  balance, 
  pnl, 
  isPositivePnl,
  onDeposit,
  onWithdraw
}) => {
  return (
    <div className="bg-[#2a2a2a] rounded-lg p-6 mx-4 mt-4 shadow-lg">
      {/* Saldo e P&L */}
      <div className="mb-6">
        <h2 className="text-silver text-sm mb-2">SALDO DISPONÍVEL</h2>
        <p className="text-golden text-3xl font-bold mb-2">{balance}</p>
        <p className={`text-lg font-semibold ${isPositivePnl ? 'text-[#27c93f]' : 'text-[#e74c3c]'}`}>
          P&L {pnl}
        </p>
      </div>

      {/* Botões de Ação */}
      <div className="flex space-x-3">
        <button
          onClick={onDeposit}
          className="flex-1 bg-[#27c93f] hover:bg-[#22a835] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span className="text-lg">💰</span>
          <span>Depositar</span>
        </button>
        
        <button
          onClick={onWithdraw}
          className="flex-1 bg-[#e74c3c] hover:bg-[#c0392b] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span className="text-lg">💸</span>
          <span>Sacar</span>
        </button>
      </div>
    </div>
  );
};

export default PremiumBalanceCard;

