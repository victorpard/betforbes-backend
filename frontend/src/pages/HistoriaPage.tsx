import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Tipos para o histórico de apostas
interface BetHistory {
  id: string;
  date: string;
  time: string;
  asset: {
    symbol: string;
    icon: string;
    name: string;
  };
  amount: number;
  direction: 'long' | 'short';
  leverage: number;
  result: number; // Positivo = ganho, Negativo = perda
  status: 'finalizada' | 'em_aberto' | 'cancelada';
  details: {
    entryPrice: number;
    exitPrice?: number;
    fees: number;
    duration?: string;
  };
}

// Dados simulados para o histórico
const mockBetHistory: BetHistory[] = [
  {
    id: 'bet_001',
    date: '2024-06-10',
    time: '14:30',
    asset: { symbol: 'BTC', icon: '₿', name: 'Bitcoin' },
    amount: 3175,
    direction: 'long',
    leverage: 3,
    result: 952.5,
    status: 'finalizada',
    details: { entryPrice: 45000, exitPrice: 46500, fees: 3.18, duration: '2h 15min' }
  },
  {
    id: 'bet_002',
    date: '2024-06-10',
    time: '12:15',
    asset: { symbol: 'ETH', icon: 'Ξ', name: 'Ethereum' },
    amount: 2540,
    direction: 'short',
    leverage: 5,
    result: -381,
    status: 'finalizada',
    details: { entryPrice: 3200, exitPrice: 3230, fees: 2.54, duration: '1h 45min' }
  },
  {
    id: 'bet_003',
    date: '2024-06-10',
    time: '10:45',
    asset: { symbol: 'BNB', icon: 'B', name: 'Binance Coin' },
    amount: 1270,
    direction: 'long',
    leverage: 2,
    result: 254,
    status: 'finalizada',
    details: { entryPrice: 320, exitPrice: 340, fees: 1.27, duration: '3h 20min' }
  },
  {
    id: 'bet_004',
    date: '2024-06-09',
    time: '16:20',
    asset: { symbol: 'ADA', icon: 'A', name: 'Cardano' },
    amount: 635,
    direction: 'long',
    leverage: 10,
    result: 1270,
    status: 'finalizada',
    details: { entryPrice: 0.45, exitPrice: 0.47, fees: 0.64, duration: '4h 10min' }
  },
  {
    id: 'bet_005',
    date: '2024-06-09',
    time: '14:00',
    asset: { symbol: 'SOL', icon: 'S', name: 'Solana' },
    amount: 1905,
    direction: 'short',
    leverage: 4,
    result: -571.5,
    status: 'finalizada',
    details: { entryPrice: 95, exitPrice: 98, fees: 1.91, duration: '1h 30min' }
  },
  {
    id: 'bet_006',
    date: '2024-06-09',
    time: '11:30',
    asset: { symbol: 'BTC', icon: '₿', name: 'Bitcoin' },
    amount: 4445,
    direction: 'long',
    leverage: 1,
    result: 444.5,
    status: 'finalizada',
    details: { entryPrice: 44500, exitPrice: 45000, fees: 4.45, duration: '5h 45min' }
  },
  {
    id: 'bet_007',
    date: '2024-06-08',
    time: '15:45',
    asset: { symbol: 'ETH', icon: 'Ξ', name: 'Ethereum' },
    amount: 3200,
    direction: 'long',
    leverage: 2,
    result: 0,
    status: 'em_aberto',
    details: { entryPrice: 3180, fees: 3.20 }
  },
  {
    id: 'bet_008',
    date: '2024-06-08',
    time: '13:20',
    asset: { symbol: 'BNB', icon: 'B', name: 'Binance Coin' },
    amount: 960,
    direction: 'short',
    leverage: 3,
    result: 0,
    status: 'cancelada',
    details: { entryPrice: 320, fees: 0.96 }
  }
];

const HistoriaPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados para filtros
  const [selectedAsset, setSelectedAsset] = useState<string>('todos');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('todos');
  const [selectedResult, setSelectedResult] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBet, setSelectedBet] = useState<BetHistory | null>(null);

  // Filtrar dados baseado nos filtros selecionados
  const filteredHistory = useMemo(() => {
    return mockBetHistory.filter(bet => {
      // Filtro por ativo
      if (selectedAsset !== 'todos' && bet.asset.symbol !== selectedAsset) return false;
      
      // Filtro por período
      if (selectedPeriod !== 'todos') {
        const betDate = new Date(bet.date);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - betDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (selectedPeriod === '24h' && diffDays > 1) return false;
        if (selectedPeriod === '7d' && diffDays > 7) return false;
        if (selectedPeriod === '30d' && diffDays > 30) return false;
      }
      
      // Filtro por resultado
      if (selectedResult !== 'todos') {
        if (selectedResult === 'vitoria' && bet.result <= 0) return false;
        if (selectedResult === 'derrota' && bet.result >= 0) return false;
      }
      
      // Filtro por status
      if (selectedStatus !== 'todos' && bet.status !== selectedStatus) return false;
      
      // Busca por termo
      if (searchTerm && !bet.asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !bet.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      return true;
    });
  }, [selectedAsset, selectedPeriod, selectedResult, selectedStatus, searchTerm]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalApostado = filteredHistory.reduce((sum, bet) => sum + bet.amount, 0);
    const totalResultado = filteredHistory.reduce((sum, bet) => sum + bet.result, 0);
    const totalApostas = filteredHistory.length;
    const vitorias = filteredHistory.filter(bet => bet.result > 0).length;
    const percentualVitorias = totalApostas > 0 ? (vitorias / totalApostas) * 100 : 0;
    
    return {
      totalApostado,
      totalResultado,
      totalApostas,
      percentualVitorias
    };
  }, [filteredHistory]);

  // Obter lista única de ativos
  const uniqueAssets = Array.from(new Set(mockBetHistory.map(bet => bet.asset.symbol)));

  // Função para formatar data
  const formatDate = (date: string, time: string) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month} ${time}`;
  };

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalizada': return 'bg-gray-600 text-white';
      case 'em_aberto': return 'bg-blue-600 text-white';
      case 'cancelada': return 'bg-orange-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  // Função para formatar status
  const formatStatus = (status: string) => {
    switch (status) {
      case 'finalizada': return 'Finalizada';
      case 'em_aberto': return 'Em Aberto';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-4 pt-8">
        <button 
          onClick={() => navigate('/')}
          className="text-golden text-xl hover:text-golden/80 transition-colors"
        >
          ←
        </button>
        <h1 className="text-golden text-2xl font-bold">HISTÓRICO DE APOSTAS</h1>
        <div className="w-6"></div>
      </header>

      {/* Conteúdo principal */}
      <main className="px-4 pb-20">
        {/* Resumo Estatístico */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 mb-6">
          <h2 className="text-golden text-lg font-bold mb-4">RESUMO</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-silver text-sm">Total Apostado</p>
              <p className="text-white font-bold text-lg">R$ {stats.totalApostado.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-silver text-sm">Resultado</p>
              <p className={`font-bold text-lg ${stats.totalResultado >= 0 ? 'text-[#27c93f]' : 'text-[#e74c3c]'}`}>
                {stats.totalResultado >= 0 ? '+' : ''}R$ {stats.totalResultado.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-silver text-sm">Total de Apostas</p>
              <p className="text-white font-bold text-lg">{stats.totalApostas}</p>
            </div>
            <div className="text-center">
              <p className="text-silver text-sm">Taxa de Vitória</p>
              <p className="text-golden font-bold text-lg">{stats.percentualVitorias.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 mb-6">
          <h3 className="text-silver text-sm mb-3">FILTROS</h3>
          
          {/* Busca */}
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ativo ou ID..."
              className="w-full bg-black text-white p-3 rounded-lg border border-gray-600 focus:border-golden outline-none"
            />
          </div>

          {/* Filtros em grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Filtro por Ativo */}
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="bg-black text-white p-2 rounded border border-gray-600 focus:border-golden outline-none"
            >
              <option value="todos">Todos os Ativos</option>
              {uniqueAssets.map(asset => (
                <option key={asset} value={asset}>{asset}</option>
              ))}
            </select>

            {/* Filtro por Período */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-black text-white p-2 rounded border border-gray-600 focus:border-golden outline-none"
            >
              <option value="todos">Todos os Períodos</option>
              <option value="24h">Últimas 24h</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>

            {/* Filtro por Resultado */}
            <select
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value)}
              className="bg-black text-white p-2 rounded border border-gray-600 focus:border-golden outline-none"
            >
              <option value="todos">Todos os Resultados</option>
              <option value="vitoria">Vitórias</option>
              <option value="derrota">Derrotas</option>
            </select>

            {/* Filtro por Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-black text-white p-2 rounded border border-gray-600 focus:border-golden outline-none"
            >
              <option value="todos">Todos os Status</option>
              <option value="finalizada">Finalizada</option>
              <option value="em_aberto">Em Aberto</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        {/* Lista de Apostas */}
        {filteredHistory.length === 0 ? (
          <div className="bg-[#2a2a2a] rounded-lg p-8 text-center">
            <p className="text-silver text-lg">Nenhuma aposta encontrada</p>
            <p className="text-silver text-sm mt-2">Tente ajustar os filtros ou fazer uma nova aposta</p>
          </div>
        ) : (
          <>
            {/* Versão Desktop - Tabela */}
            <div className="hidden md:block bg-[#2a2a2a] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1e1e1e]">
                    <tr>
                      <th className="text-left p-4 text-silver text-sm">Data/Hora</th>
                      <th className="text-left p-4 text-silver text-sm">Ativo</th>
                      <th className="text-left p-4 text-silver text-sm">Valor</th>
                      <th className="text-left p-4 text-silver text-sm">Direção</th>
                      <th className="text-left p-4 text-silver text-sm">Alavancagem</th>
                      <th className="text-left p-4 text-silver text-sm">Resultado</th>
                      <th className="text-left p-4 text-silver text-sm">Status</th>
                      <th className="text-left p-4 text-silver text-sm">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((bet, index) => (
                      <tr key={bet.id} className={`border-t border-gray-600 ${index % 2 === 0 ? 'bg-[#2a2a2a]' : 'bg-[#252525]'}`}>
                        <td className="p-4 text-white text-sm">
                          {formatDate(bet.date, bet.time)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{bet.asset.icon}</span>
                            <span className="text-white font-semibold">{bet.asset.symbol}</span>
                          </div>
                        </td>
                        <td className="p-4 text-white font-semibold">
                          R$ {bet.amount.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <div className={`flex items-center space-x-1 ${bet.direction === 'long' ? 'text-[#27c93f]' : 'text-[#e74c3c]'}`}>
                            <span>{bet.direction === 'long' ? '⬆️' : '⬇️'}</span>
                            <span className="font-semibold">{bet.direction === 'long' ? 'LONG' : 'SHORT'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-white font-semibold">
                          {bet.leverage}x
                        </td>
                        <td className="p-4">
                          {bet.status === 'finalizada' ? (
                            <span className={`font-semibold ${bet.result >= 0 ? 'text-[#27c93f]' : 'text-[#e74c3c]'}`}>
                              {bet.result >= 0 ? '+' : ''}R$ {bet.result.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-silver">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(bet.status)}`}>
                            {formatStatus(bet.status)}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => setSelectedBet(bet)}
                            className="text-golden hover:text-golden/80 text-sm font-semibold"
                          >
                            Ver detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Versão Mobile - Cards */}
            <div className="md:hidden space-y-4">
              {filteredHistory.map((bet) => (
                <div key={bet.id} className="bg-[#2a2a2a] rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{bet.asset.icon}</span>
                      <div>
                        <p className="text-white font-semibold">{bet.asset.symbol}</p>
                        <p className="text-silver text-xs">{formatDate(bet.date, bet.time)}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(bet.status)}`}>
                      {formatStatus(bet.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-silver text-xs">Valor</p>
                      <p className="text-white font-semibold">R$ {bet.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-silver text-xs">Alavancagem</p>
                      <p className="text-white font-semibold">{bet.leverage}x</p>
                    </div>
                    <div>
                      <p className="text-silver text-xs">Direção</p>
                      <div className={`flex items-center space-x-1 ${bet.direction === 'long' ? 'text-[#27c93f]' : 'text-[#e74c3c]'}`}>
                        <span>{bet.direction === 'long' ? '⬆️' : '⬇️'}</span>
                        <span className="font-semibold">{bet.direction === 'long' ? 'LONG' : 'SHORT'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-silver text-xs">Resultado</p>
                      {bet.status === 'finalizada' ? (
                        <p className={`font-semibold ${bet.result >= 0 ? 'text-[#27c93f]' : 'text-[#e74c3c]'}`}>
                          {bet.result >= 0 ? '+' : ''}R$ {bet.result.toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-silver">-</p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedBet(bet)}
                    className="w-full bg-golden text-black py-2 rounded font-semibold hover:bg-golden/90 transition-colors"
                  >
                    Ver detalhes
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Modal de Detalhes */}
      {selectedBet && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-golden text-xl font-bold">DETALHES DA APOSTA</h3>
              <button
                onClick={() => setSelectedBet(null)}
                className="text-silver hover:text-white text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl">{selectedBet.asset.icon}</span>
                <div>
                  <p className="text-white font-bold text-lg">{selectedBet.asset.symbol}</p>
                  <p className="text-silver text-sm">{selectedBet.asset.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-silver text-sm">ID da Aposta</p>
                  <p className="text-white font-semibold">{selectedBet.id}</p>
                </div>
                <div>
                  <p className="text-silver text-sm">Data/Hora</p>
                  <p className="text-white font-semibold">{formatDate(selectedBet.date, selectedBet.time)}</p>
                </div>
                <div>
                  <p className="text-silver text-sm">Valor Apostado</p>
                  <p className="text-white font-semibold">R$ {selectedBet.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-silver text-sm">Alavancagem</p>
                  <p className="text-white font-semibold">{selectedBet.leverage}x</p>
                </div>
                <div>
                  <p className="text-silver text-sm">Direção</p>
                  <div className={`flex items-center space-x-1 ${selectedBet.direction === 'long' ? 'text-[#27c93f]' : 'text-[#e74c3c]'}`}>
                    <span>{selectedBet.direction === 'long' ? '⬆️' : '⬇️'}</span>
                    <span className="font-semibold">{selectedBet.direction === 'long' ? 'LONG' : 'SHORT'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-silver text-sm">Status</p>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedBet.status)}`}>
                    {formatStatus(selectedBet.status)}
                  </span>
                </div>
                <div>
                  <p className="text-silver text-sm">Preço de Entrada</p>
                  <p className="text-white font-semibold">${selectedBet.details.entryPrice.toLocaleString()}</p>
                </div>
                {selectedBet.details.exitPrice && (
                  <div>
                    <p className="text-silver text-sm">Preço de Saída</p>
                    <p className="text-white font-semibold">${selectedBet.details.exitPrice.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-silver text-sm">Taxas</p>
                  <p className="text-white font-semibold">R$ {selectedBet.details.fees.toFixed(2)}</p>
                </div>
                {selectedBet.details.duration && (
                  <div>
                    <p className="text-silver text-sm">Duração</p>
                    <p className="text-white font-semibold">{selectedBet.details.duration}</p>
                  </div>
                )}
              </div>

              {selectedBet.status === 'finalizada' && (
                <div className="border-t border-gray-600 pt-4">
                  <div className="text-center">
                    <p className="text-silver text-sm">Resultado Final</p>
                    <p className={`text-2xl font-bold ${selectedBet.result >= 0 ? 'text-[#27c93f]' : 'text-[#e74c3c]'}`}>
                      {selectedBet.result >= 0 ? '+' : ''}R$ {selectedBet.result.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedBet(null)}
              className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-500 transition-colors mt-6"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoriaPage;

