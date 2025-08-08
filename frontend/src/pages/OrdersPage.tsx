import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface OrdersPageProps {}

interface Order {
  id: string;
  asset: string;
  direction: 'LONG' | 'SHORT';
  amount: string;
  leverage: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
  timestamp: string;
}

const OrdersPage: React.FC<OrdersPageProps> = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<{asset: string, direction: string}>({
    asset: '',
    direction: ''
  });
  const [loading, setLoading] = useState(false);
  const [closingOrderId, setClosingOrderId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dados simulados de ordens
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ord-001',
      asset: 'BTC',
      direction: 'LONG',
      amount: 'R$ 2.500,00',
      leverage: 10,
      entryPrice: 42500.00,
      currentPrice: 43200.00,
      pnl: 1645.00,
      pnlPercentage: 6.58,
      timestamp: '2025-06-11T14:32:00Z'
    },
    {
      id: 'ord-002',
      asset: 'ETH',
      direction: 'SHORT',
      amount: 'R$ 1.800,00',
      leverage: 5,
      entryPrice: 2850.00,
      currentPrice: 2920.00,
      pnl: -630.00,
      pnlPercentage: -7.00,
      timestamp: '2025-06-11T15:45:00Z'
    },
    {
      id: 'ord-003',
      asset: 'BNB',
      direction: 'LONG',
      amount: 'R$ 950,00',
      leverage: 3,
      entryPrice: 320.00,
      currentPrice: 328.50,
      pnl: 79.69,
      pnlPercentage: 8.39,
      timestamp: '2025-06-11T16:20:00Z'
    },
    {
      id: 'ord-004',
      asset: 'SOL',
      direction: 'LONG',
      amount: 'R$ 1.200,00',
      leverage: 8,
      entryPrice: 98.50,
      currentPrice: 97.20,
      pnl: -125.89,
      pnlPercentage: -10.49,
      timestamp: '2025-06-11T17:05:00Z'
    },
    {
      id: 'ord-005',
      asset: 'BTC',
      direction: 'SHORT',
      amount: 'R$ 3.000,00',
      leverage: 15,
      entryPrice: 43100.00,
      currentPrice: 43200.00,
      pnl: -450.00,
      pnlPercentage: -1.50,
      timestamp: '2025-06-11T18:10:00Z'
    }
  ]);

  // Filtrar ordens
  const filteredOrders = orders.filter(order => {
    return (
      (filter.asset === '' || order.asset === filter.asset) &&
      (filter.direction === '' || order.direction === filter.direction)
    );
  });

  // Simular atualização de preços em tempo real
  React.useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => 
        prevOrders.map(order => {
          // Simular flutuação de preço (±0.5%)
          const priceChange = order.currentPrice * (Math.random() * 0.01 - 0.005);
          const newPrice = order.currentPrice + priceChange;
          
          // Calcular novo P&L
          const priceDiff = order.direction === 'LONG' 
            ? newPrice - order.entryPrice 
            : order.entryPrice - newPrice;
          
          const leverage = order.leverage;
          const amountValue = parseFloat(order.amount.replace(/[^\d,]/g, '').replace(',', '.'));
          const newPnl = (priceDiff / order.entryPrice) * amountValue * leverage;
          const newPnlPercentage = (newPnl / amountValue) * 100;
          
          return {
            ...order,
            currentPrice: newPrice,
            pnl: newPnl,
            pnlPercentage: newPnlPercentage
          };
        })
      );
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCloseOrder = async (orderId: string) => {
    setClosingOrderId(orderId);
    setLoading(true);
    
    // Simular fechamento de ordem
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    setLoading(false);
    setClosingOrderId(null);
    setSuccessMessage(`Ordem ${orderId} fechada com sucesso!`);
    
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white pb-20">
      {/* Header */}
      <header className="flex justify-between items-center p-4 pt-8">
        <button
          onClick={() => navigate('/')}
          className="text-golden text-2xl hover:scale-110 transition-transform"
        >
          ←
        </button>
        <h1 className="text-golden text-2xl font-bold">Ordens em Aberto</h1>
        <div className="w-8"></div>
      </header>

      {/* Conteúdo principal */}
      <main className="px-4 pb-20">
        {/* Mensagem de sucesso */}
        {successMessage && (
          <div className="bg-[#27c93f] bg-opacity-20 border border-[#27c93f] rounded-lg p-3 mb-4 flex justify-between items-center">
            <p className="text-[#27c93f] text-sm">✅ {successMessage}</p>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="text-[#27c93f] text-lg"
            >
              ×
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 mb-4">
          <h3 className="text-silver text-sm mb-3">FILTROS</h3>
          <div className="flex space-x-3">
            <select
              value={filter.asset}
              onChange={(e) => setFilter({...filter, asset: e.target.value})}
              className="bg-[#1e1e1e] text-white border border-gray-700 rounded-lg px-3 py-2 flex-1"
            >
              <option value="">Todos os ativos</option>
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="BNB">Binance Coin (BNB)</option>
              <option value="SOL">Solana (SOL)</option>
              <option value="ADA">Cardano (ADA)</option>
            </select>
            
            <select
              value={filter.direction}
              onChange={(e) => setFilter({...filter, direction: e.target.value as 'LONG' | 'SHORT'})}
              className="bg-[#1e1e1e] text-white border border-gray-700 rounded-lg px-3 py-2 flex-1"
            >
              <option value="">Todas as direções</option>
              <option value="LONG">Compra (LONG)</option>
              <option value="SHORT">Venda (SHORT)</option>
            </select>
          </div>
        </div>

        {/* Lista de ordens - Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full bg-[#2a2a2a] rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#333]">
                <th className="text-left p-4 text-silver">Ativo</th>
                <th className="text-left p-4 text-silver">Direção</th>
                <th className="text-left p-4 text-silver">Valor</th>
                <th className="text-left p-4 text-silver">Alavancagem</th>
                <th className="text-left p-4 text-silver">Preço Entrada</th>
                <th className="text-left p-4 text-silver">Preço Atual</th>
                <th className="text-left p-4 text-silver">P&L</th>
                <th className="text-left p-4 text-silver">Data/Hora</th>
                <th className="text-center p-4 text-silver">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t border-gray-700">
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{
                          order.asset === 'BTC' ? '₿' :
                          order.asset === 'ETH' ? 'Ξ' :
                          order.asset === 'BNB' ? 'BNB' :
                          order.asset === 'SOL' ? 'SOL' :
                          order.asset === 'ADA' ? 'ADA' : '💰'
                        }</span>
                        <span>{order.asset}</span>
                      </div>
                    </td>
                    <td className={`p-4 ${order.direction === 'LONG' ? 'text-[#27c93f]' : 'text-[#e74c3c]'}`}>
                      {order.direction}
                    </td>
                    <td className="p-4">{order.amount}</td>
                    <td className="p-4">{order.leverage}x</td>
                    <td className="p-4">
                      {order.entryPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <span>{order.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <span className="animate-pulse">•</span>
                      </div>
                    </td>
                    <td className={`p-4 ${order.pnl >= 0 ? 'text-[#27c93f]' : 'text-[#e74c3c]'}`}>
                      <div>
                        {order.pnl >= 0 ? '+' : ''}{order.pnl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs">
                        {order.pnl >= 0 ? '+' : ''}{order.pnlPercentage.toFixed(2)}%
                      </div>
                    </td>
                    <td className="p-4 text-silver">
                      {formatTimestamp(order.timestamp)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleCloseOrder(order.id)}
                        disabled={loading && closingOrderId === order.id}
                        className="bg-[#e74c3c] hover:bg-[#c0392b] text-white py-1 px-3 rounded-lg transition-colors disabled:opacity-50 text-sm"
                      >
                        {loading && closingOrderId === order.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mx-auto"></div>
                        ) : (
                          'Fechar'
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400">
                    Nenhuma ordem em aberto encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Lista de ordens - Mobile */}
        <div className="md:hidden space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-[#2a2a2a] rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{
                      order.asset === 'BTC' ? '₿' :
                      order.asset === 'ETH' ? 'Ξ' :
                      order.asset === 'BNB' ? 'BNB' :
                      order.asset === 'SOL' ? 'SOL' :
                      order.asset === 'ADA' ? 'ADA' : '💰'
                    }</span>
                    <span className="font-semibold">{order.asset}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    order.direction === 'LONG' 
                      ? 'bg-[#27c93f] bg-opacity-20 text-[#27c93f]' 
                      : 'bg-[#e74c3c] bg-opacity-20 text-[#e74c3c]'
                  }`}>
                    {order.direction}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-silver">Valor:</p>
                    <p>{order.amount}</p>
                  </div>
                  <div>
                    <p className="text-silver">Alavancagem:</p>
                    <p>{order.leverage}x</p>
                  </div>
                  <div>
                    <p className="text-silver">Preço Entrada:</p>
                    <p>{order.entryPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-silver">Preço Atual:</p>
                    <p className="flex items-center space-x-1">
                      <span>{order.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span className="animate-pulse text-xs">•</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-silver text-xs">P&L:</p>
                    <p className={`font-semibold ${order.pnl >= 0 ? 'text-[#27c93f]' : 'text-[#e74c3c]'}`}>
                      {order.pnl >= 0 ? '+' : ''}{order.pnl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      <span className="text-xs ml-1">
                        ({order.pnl >= 0 ? '+' : ''}{order.pnlPercentage.toFixed(2)}%)
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-silver text-xs">Data/Hora:</p>
                    <p className="text-xs">{formatTimestamp(order.timestamp)}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleCloseOrder(order.id)}
                  disabled={loading && closingOrderId === order.id}
                  className="w-full bg-[#e74c3c] hover:bg-[#c0392b] text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading && closingOrderId === order.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    'Fechar Ordem'
                  )}
                </button>
              </div>
            ))
          ) : (
            <div className="bg-[#2a2a2a] rounded-lg p-8 text-center text-gray-400">
              Nenhuma ordem em aberto encontrada
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrdersPage;
