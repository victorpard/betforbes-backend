import React from 'react';

interface BetSummaryProps {
  totalBet: string;
  totalWins: number;
}

const BetSummary: React.FC<BetSummaryProps> = ({ totalBet, totalWins }) => {
  return (
    <div className="bg-[#2a2a2a] rounded-lg p-4 mx-4 mt-4 shadow-lg flex justify-around items-center">
      <div className="text-center">
        <p className="text-silver text-sm">TOTAL APOSTADO</p>
        <p className="text-white text-xl font-bold mt-1">{totalBet}</p>
      </div>
      <div className="text-center">
        <p className="text-silver text-sm">TOTAL DE VITÓRIAS</p>
        <p className="text-white text-xl font-bold mt-1">{totalWins}</p>
      </div>
    </div>
  );
};

export default BetSummary;
