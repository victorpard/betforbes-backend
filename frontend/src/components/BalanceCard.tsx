import React from 'react';

interface BalanceCardProps {
  balance: string;
  pnl: string;
  isPositivePnl: boolean;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance, pnl, isPositivePnl }) => {
  // Dados simulados para o gráfico
  const chartData = [
    { x: 0, y: 50 }, { x: 10, y: 60 }, { x: 20, y: 40 }, { x: 30, y: 70 },
    { x: 40, y: 55 }, { x: 50, y: 65 }, { x: 60, y: 45 }, { x: 70, y: 75 },
    { x: 80, y: 60 }, { x: 90, y: 80 }, { x: 100, y: 70 }
  ];

  const pathData = chartData.map((point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${command}${point.x},${100 - point.y}`; // Inverter Y para que o gráfico cresça para cima
  }).join(' ');

  return (
    <div className="bg-[#2a2a2a] rounded-lg p-4 mx-4 mt-4 shadow-lg">
      <h2 className="text-silver text-sm mb-2">SALDO DISPONÍVEL</h2>
      <p className="text-golden text-3xl font-bold mb-2">{balance}</p>
      <p className={`text-sm font-semibold ${isPositivePnl ? 'text-green-500' : 'text-red-500'}`}>
        P&L {pnl}
      </p>
      <div className="mt-4 h-24">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <path
            d={pathData}
            fill="none"
            stroke="#FFD700"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default BalanceCard;
