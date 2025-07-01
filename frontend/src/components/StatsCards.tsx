import React from 'react';

interface StatsCardsProps {
  totalBet: string;
  totalWins: number;
  winRate?: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ 
  totalBet, 
  totalWins, 
  winRate = 0 
}) => {
  return (
    <div className="px-4 mt-6">
      <h3 className="text-golden text-lg font-semibold mb-4">Resumo</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Card Total Apostado */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📊</span>
            <span className="text-silver text-xs">TOTAL</span>
          </div>
          <p className="text-silver text-sm mb-1">Total Apostado</p>
          <p className="text-golden text-xl font-bold">{totalBet}</p>
        </div>

        {/* Card Total de Vitórias */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🏆</span>
            <span className="text-silver text-xs">VITÓRIAS</span>
          </div>
          <p className="text-silver text-sm mb-1">Total de Vitórias</p>
          <p className="text-[#27c93f] text-xl font-bold">{totalWins}</p>
        </div>
      </div>

      {/* Taxa de Vitória */}
      {winRate > 0 && (
        <div className="bg-[#2a2a2a] rounded-lg p-4 mt-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📈</span>
              <div>
                <p className="text-silver text-sm">Taxa de Vitória</p>
                <p className="text-golden text-lg font-bold">{winRate.toFixed(1)}%</p>
              </div>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#444"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth="2"
                  strokeDasharray={`${winRate}, 100`}
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCards;

