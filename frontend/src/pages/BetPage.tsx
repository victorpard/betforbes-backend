import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Tipos para os dados da aposta
interface Asset {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  price: number;
  change24h: number; // Variação percentual 24h
  volume24h: number; // Volume 24h
  volume1h: number; // Volume 1h
  chartData: { time: string, price: number }[]; // Dados do gráfico
  orderBook: {
    bids: { price: number, amount: number }[]; // Ordens de compra
    asks: { price: number, amount: number }[]; // Ordens de venda
  };
}

// Tipos de ordem
type OrderType = 'market' | 'limit';

interface BetData {
  asset: Asset | null;
  amount: string;
  leverage: number;
  direction: 'long' | 'short' | null;
  orderType: OrderType;
  targetPrice: string; // Preço alvo para ordem limitada
  potentialGain: number;
  potentialLoss: number;
  fees: number;
}

const BetPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estado para os dados da aposta
  const [betData, setBetData] = useState<BetData>({
    asset: null,
    amount: '',
    leverage: 1,
    direction: null,
    orderType: 'market', // Padrão: ordem a mercado
    targetPrice: '',
    potentialGain: 0,
    potentialLoss: 0,
    fees: 0,
  });

  // Estados para o dropdown de ativos
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('24h');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Estados para modal e feedback
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Saldo disponível (simulado)
  const availableBalance = 12700;

  // Dados simulados dos ativos
  const assets: Asset[] = [
    {
      id: 'btc',
      name: 'Bitcoin',
      symbol: 'BTC',
      icon: '₿',
      price: 45000,
      change24h: 2.5,
      volume24h: 28500000000,
      volume1h: 1200000000,
      chartData: [
        { time: '00:00', price: 44000 },
        { time: '04:00', price: 44500 },
        { time: '08:00', price: 45200 },
        { time: '12:00', price: 44800 },
        { time: '16:00', price: 45000 },
        { time: '20:00', price: 45300 },
        { time: '24:00', price: 45000 },
      ],
      orderBook: {
        bids: [
          { price: 44995, amount: 0.5 },
          { price: 44990, amount: 1.2 },
          { price: 44985, amount: 0.8 },
        ],
        asks: [
          { price: 45005, amount: 0.7 },
          { price: 45010, amount: 1.1 },
          { price: 45015, amount: 0.9 },
        ],
      },
    },
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      icon: 'Ξ',
      price: 2800,
      change24h: -1.2,
      volume24h: 15200000000,
      volume1h: 650000000,
      chartData: [
        { time: '00:00', price: 2850 },
        { time: '04:00', price: 2820 },
        { time: '08:00', price: 2790 },
        { time: '12:00', price: 2810 },
        { time: '16:00', price: 2800 },
        { time: '20:00', price: 2795 },
        { time: '24:00', price: 2800 },
      ],
      orderBook: {
        bids: [
          { price: 2799, amount: 2.1 },
          { price: 2798, amount: 3.5 },
          { price: 2797, amount: 1.8 },
        ],
        asks: [
          { price: 2801, amount: 2.3 },
          { price: 2802, amount: 1.9 },
          { price: 2803, amount: 2.7 },
        ],
      },
    },
    {
      id: 'bnb',
      name: 'BNB',
      symbol: 'BNB',
      icon: 'B',
      price: 320,
      change24h: 0.8,
      volume24h: 890000000,
      volume1h: 38000000,
      chartData: [
        { time: '00:00', price: 318 },
        { time: '04:00', price: 319 },
        { time: '08:00', price: 321 },
        { time: '12:00', price: 320 },
        { time: '16:00', price: 320 },
        { time: '20:00', price: 322 },
        { time: '24:00', price: 320 },
      ],
      orderBook: {
        bids: [
          { price: 319.8, amount: 15.2 },
          { price: 319.5, amount: 22.1 },
          { price: 319.2, amount: 18.7 },
        ],
        asks: [
          { price: 320.2, amount: 16.8 },
          { price: 320.5, amount: 19.3 },
          { price: 320.8, amount: 14.6 },
        ],
      },
    },
    {
      id: 'ada',
      name: 'Cardano',
      symbol: 'ADA',
      icon: 'A',
      price: 0.45,
      change24h: 3.2,
      volume24h: 420000000,
      volume1h: 18000000,
      chartData: [
        { time: '00:00', price: 0.44 },
        { time: '04:00', price: 0.445 },
        { time: '08:00', price: 0.448 },
        { time: '12:00', price: 0.452 },
        { time: '16:00', price: 0.45 },
        { time: '20:00', price: 0.451 },
        { time: '24:00', price: 0.45 },
      ],
      orderBook: {
        bids: [
          { price: 0.4498, amount: 1250 },
          { price: 0.4495, amount: 2100 },
          { price: 0.4492, amount: 1800 },
        ],
        asks: [
          { price: 0.4502, amount: 1350 },
          { price: 0.4505, amount: 1950 },
          { price: 0.4508, amount: 1650 },
        ],
      },
    },
    {
      id: 'sol',
      name: 'Solana',
      symbol: 'SOL',
      icon: 'S',
      price: 95,
      change24h: -2.1,
      volume24h: 1200000000,
      volume1h: 52000000,
      chartData: [
        { time: '00:00', price: 97 },
        { time: '04:00', price: 96 },
        { time: '08:00', price: 94 },
        { time: '12:00', price: 95 },
        { time: '16:00', price: 95 },
        { time: '20:00', price: 94.5 },
        { time: '24:00', price: 95 },
      ],
      orderBook: {
        bids: [
          { price: 94.8, amount: 45.2 },
          { price: 94.5, amount: 62.1 },
          { price: 94.2, amount: 38.7 },
        ],
        asks: [
          { price: 95.2, amount: 48.8 },
          { price: 95.5, amount: 55.3 },
          { price: 95.8, amount: 41.6 },
        ],
      },
    },
  ];

  // Filtrar ativos baseado na busca
  const filteredAssets = useMemo(() => {
    return assets.filter(asset =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calcular ganhos/perdas potenciais
  useEffect(() => {
    if (betData.asset && betData.amount && betData.direction) {
      const amount = parseFloat(betData.amount);
      const leverage = betData.leverage;
      const price = betData.asset.price;
      
      // Cálculo simplificado (5% de movimento)
      const priceMovement = price * 0.05;
      const leveragedAmount = amount * leverage;
      const gain = (priceMovement / price) * leveragedAmount;
      const fees = amount * 0.001; // 0.1% de taxa
      
      setBetData(prev => ({
        ...prev,
        potentialGain: gain,
        potentialLoss: gain,
        fees: fees,
      }));
    }
  }, [betData.asset, betData.amount, betData.leverage, betData.direction]);

  // Funções de manipulação
  const handleAssetSelect = (asset: Asset) => {
    setBetData(prev => ({ ...prev, asset }));
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handleAmountChange = (value: string) => {
    // Permitir apenas números e vírgula/ponto
    const numericValue = value.replace(/[^0-9.,]/g, '');
    setBetData(prev => ({ ...prev, amount: numericValue }));
  };

  const handleTargetPriceChange = (value: string) => {
    // Permitir apenas números e vírgula/ponto para preço alvo
    const numericValue = value.replace(/[^0-9.,]/g, '');
    setBetData(prev => ({ ...prev, targetPrice: numericValue }));
  };

  const handlePercentageClick = (percentage: number) => {
    const amount = (availableBalance * percentage / 100).toString();
    setBetData(prev => ({ ...prev, amount }));
  };

  const handleLeverageChange = (value: number) => {
    setBetData(prev => ({ ...prev, leverage: Math.max(1, Math.min(50, value)) }));
  };

  const handleDirectionSelect = (direction: 'long' | 'short') => {
    setBetData(prev => ({ ...prev, direction }));
  };

  const handleOrderTypeChange = (orderType: OrderType) => {
    setBetData(prev => ({ 
      ...prev, 
      orderType,
      targetPrice: orderType === 'market' ? '' : prev.targetPrice
    }));
  };

  const getRiskLevel = (leverage: number) => {
    if (leverage <= 5) return { level: 'Baixo', color: 'bg-green-500' };
    if (leverage <= 15) return { level: 'Médio', color: 'bg-yellow-500' };
    if (leverage <= 30) return { level: 'Alto', color: 'bg-orange-500' };
    return { level: 'Muito Alto', color: 'bg-red-500' };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${(value / 1e3).toFixed(1)}K`;
  };

  const canPlaceBet = () => {
    const amount = parseFloat(betData.amount);
    const targetPrice = parseFloat(betData.targetPrice);
    
    return (
      betData.asset &&
      betData.amount &&
      amount > 0 &&
      amount <= availableBalance &&
      betData.direction &&
      (betData.orderType === 'market' || (betData.orderType === 'limit' && targetPrice > 0))
    );
  };

  const handleConfirmBet = () => {
    if (canPlaceBet()) {
      setShowConfirmModal(false);
      setShowSuccessMessage(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        setBetData({
          asset: null,
          amount: '',
          leverage: 1,
          direction: null,
          orderType: 'market',
          targetPrice: '',
          potentialGain: 0,
          potentialLoss: 0,
          fees: 0,
        });
        setSearchTerm('');
      }, 3000);
    }
  };

  const risk = getRiskLevel(betData.leverage);

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-700">
        <button 
          onClick={() => navigate('/')}
          className="text-golden text-xl hover:text-yellow-400 transition-colors"
        >
          ←
        </button>
        <h1 className="text-golden text-xl font-bold">Nova Aposta</h1>
        <div className="w-6"></div>
      </header>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mx-4 mt-4 p-4 bg-green-900 border border-green-500 rounded-lg">
          <p className="text-green-400 text-center font-semibold">
            {betData.orderType === 'market' 
              ? '✅ Aposta executada com sucesso!' 
              : '✅ Ordem limitada criada com sucesso!'}
          </p>
        </div>
      )}

      <div className="p-4 space-y-6 pb-24 md:pb-6">
        {/* Seleção de Ativo */}
        <div className="space-y-3">
          <h2 className="text-golden text-lg font-semibold">Selecionar Ativo</h2>
          
          <div className="relative" ref={dropdownRef}>
            <input
              type="text"
              placeholder="Buscar criptomoeda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full p-3 bg-[#2a2a2a] border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-golden focus:outline-none"
            />
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#2a2a2a] border border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {filteredAssets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => handleAssetSelect(asset)}
                    className="w-full p-3 text-left hover:bg-[#3a3a3a] border-b border-gray-700 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{asset.icon}</span>
                        <div>
                          <div className="font-semibold">{asset.symbol}</div>
                          <div className="text-sm text-gray-400">{asset.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${asset.price.toLocaleString()}</div>
                        <div className={`text-sm ${asset.change24h >= 0 ? 'text-[#27c93f]' : 'text-[#e74c3c]'}`}>
                          {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card do Ativo Selecionado */}
        {betData.asset && (
          <div className="bg-[#2a2a2a] border-2 border-golden rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{betData.asset.icon}</span>
                <div>
                  <h3 className="text-xl font-bold">{betData.asset.name}</h3>
                  <p className="text-gray-400">{betData.asset.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${betData.asset.price.toLocaleString()}</div>
                <div className={`text-lg ${betData.asset.change24h >= 0 ? 'text-[#27c93f]' : 'text-[#e74c3c]'}`}>
                  {betData.asset.change24h >= 0 ? '+' : ''}{betData.asset.change24h.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Informações de Volume */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Volume 24h:</span>
                <span className="ml-2 text-white font-semibold">{formatVolume(betData.asset.volume24h)}</span>
              </div>
              <div>
                <span className="text-gray-400">Volume 1h:</span>
                <span className="ml-2 text-white font-semibold">{formatVolume(betData.asset.volume1h)}</span>
              </div>
            </div>

            {/* Mini Gráfico */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Gráfico de Preços</span>
                <div className="flex space-x-2">
                  {['24h', '2h', '1h', '30min'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setChartPeriod(period)}
                      className={`px-2 py-1 text-xs rounded ${
                        chartPeriod === period 
                          ? 'bg-golden text-black' 
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-20 bg-[#1e1e1e] rounded flex items-end justify-between px-2 py-2">
                {betData.asset.chartData.map((point, index) => (
                  <div
                    key={index}
                    className="bg-golden w-2 rounded-t"
                    style={{ 
                      height: `${((point.price - Math.min(...betData.asset!.chartData.map(p => p.price))) / 
                        (Math.max(...betData.asset!.chartData.map(p => p.price)) - Math.min(...betData.asset!.chartData.map(p => p.price)))) * 60 + 10}px` 
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Livro de Ordens */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="text-[#27c93f] font-semibold mb-2">BIDS (Compra)</h4>
                {betData.asset.orderBook.bids.map((bid, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span>${bid.price.toLocaleString()}</span>
                    <span className="text-gray-400">{bid.amount}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-[#e74c3c] font-semibold mb-2">ASKS (Venda)</h4>
                {betData.asset.orderBook.asks.map((ask, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span>${ask.price.toLocaleString()}</span>
                    <span className="text-gray-400">{ask.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tipo de Ordem */}
        <div className="space-y-3">
          <h2 className="text-golden text-lg font-semibold">Tipo de Ordem</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOrderTypeChange('market')}
              className={`p-4 rounded-lg border-2 transition-all ${
                betData.orderType === 'market'
                  ? 'border-golden bg-golden bg-opacity-10'
                  : 'border-gray-600 bg-[#2a2a2a] hover:border-gray-500'
              }`}
              title="Executa imediatamente pelo preço atual"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">⚡</span>
                <div className="text-left">
                  <div className="font-semibold">Ordem a Mercado</div>
                  <div className="text-xs text-gray-400">Execução imediata</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleOrderTypeChange('limit')}
              className={`p-4 rounded-lg border-2 transition-all ${
                betData.orderType === 'limit'
                  ? 'border-golden bg-golden bg-opacity-10'
                  : 'border-gray-600 bg-[#2a2a2a] hover:border-gray-500'
              }`}
              title="Executa apenas se o ativo atingir o preço desejado"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">🎯</span>
                <div className="text-left">
                  <div className="font-semibold">Ordem Limitada</div>
                  <div className="text-xs text-gray-400">Preço específico</div>
                </div>
              </div>
            </button>
          </div>

          {/* Descrições dos tipos de ordem */}
          <div className="bg-[#2a2a2a] rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <span className="text-blue-400 text-sm">ℹ️</span>
              <div className="text-sm text-gray-300">
                {betData.orderType === 'market' 
                  ? 'Ordem a Mercado: Executa imediatamente pelo preço atual do ativo.'
                  : 'Ordem Limitada: Executa apenas quando o ativo atingir o preço alvo definido por você.'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Campo de Preço Alvo (apenas para ordem limitada) */}
        {betData.orderType === 'limit' && (
          <div className="space-y-3">
            <h2 className="text-golden text-lg font-semibold">Preço Alvo</h2>
            <input
              type="text"
              placeholder="Digite o preço alvo ex: 42.500,00"
              value={betData.targetPrice}
              onChange={(e) => handleTargetPriceChange(e.target.value)}
              className="w-full p-3 bg-[#2a2a2a] border-2 border-golden rounded-lg text-white text-center text-xl font-bold placeholder-gray-400 focus:outline-none focus:border-yellow-400"
            />
            {betData.asset && betData.targetPrice && (
              <div className="text-center text-sm text-gray-400">
                Preço atual: ${betData.asset.price.toLocaleString()} | 
                Diferença: {((parseFloat(betData.targetPrice) - betData.asset.price) / betData.asset.price * 100).toFixed(2)}%
              </div>
            )}
          </div>
        )}

        {/* Valor da Aposta */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-golden text-lg font-semibold">Valor da Aposta</h2>
            <span className="text-sm text-gray-400">
              Saldo: {formatCurrency(availableBalance)}
            </span>
          </div>
          
          <input
            type="text"
            placeholder="0,00"
            value={betData.amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="w-full p-3 bg-[#2a2a2a] border-2 border-golden rounded-lg text-white text-center text-xl font-bold placeholder-gray-400 focus:outline-none focus:border-yellow-400"
          />
          
          <div className="grid grid-cols-4 gap-2">
            {[10, 25, 50, 100].map((percentage) => (
              <button
                key={percentage}
                onClick={() => handlePercentageClick(percentage)}
                className="py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition-colors"
              >
                {percentage}%
              </button>
            ))}
          </div>
        </div>

        {/* Alavancagem */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-golden text-lg font-semibold">Alavancagem</h2>
            <span className={`text-sm px-2 py-1 rounded ${risk.color} text-white`}>
              Risco: {risk.level}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleLeverageChange(betData.leverage - 1)}
              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-xl font-bold transition-colors"
              disabled={betData.leverage <= 1}
            >
              -
            </button>
            
            <div className="flex-1">
              <input
                type="range"
                min="1"
                max="50"
                value={betData.leverage}
                onChange={(e) => handleLeverageChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #FFD700 0%, #FFD700 ${(betData.leverage - 1) / 49 * 100}%, #374151 ${(betData.leverage - 1) / 49 * 100}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1x</span>
                <span className="text-golden font-bold">{betData.leverage}x</span>
                <span>50x</span>
              </div>
            </div>
            
            <div className="w-20">
              <input
                type="number"
                min="1"
                max="50"
                value={betData.leverage}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value)) {
                    handleLeverageChange(Math.max(1, Math.min(50, value)));
                  }
                }}
                className="w-full h-10 bg-[#2a2a2a] border-2 border-gray-600 rounded-lg text-white text-center font-bold focus:border-golden focus:outline-none"
              />
            </div>
            
            <button
              onClick={() => handleLeverageChange(betData.leverage + 1)}
              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-xl font-bold transition-colors"
              disabled={betData.leverage >= 50}
            >
              +
            </button>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${risk.color}`}
              style={{ width: `${(betData.leverage / 50) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Direção da Aposta */}
        <div className="space-y-3">
          <h2 className="text-golden text-lg font-semibold">Direção da Aposta</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDirectionSelect('long')}
              className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${
                betData.direction === 'long'
                  ? 'border-[#27c93f] bg-[#27c93f] bg-opacity-20'
                  : 'border-gray-600 bg-[#2a2a2a] hover:border-[#27c93f]'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">📈</span>
                <div>
                  <div className="font-bold text-[#27c93f]">COMPRAR</div>
                  <div className="text-sm text-gray-400">(LONG)</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleDirectionSelect('short')}
              className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${
                betData.direction === 'short'
                  ? 'border-[#e74c3c] bg-[#e74c3c] bg-opacity-20'
                  : 'border-gray-600 bg-[#2a2a2a] hover:border-[#e74c3c]'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">📉</span>
                <div>
                  <div className="font-bold text-[#e74c3c]">VENDER</div>
                  <div className="text-sm text-gray-400">(SHORT)</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Resumo da Aposta */}
        {betData.asset && betData.amount && betData.direction && (
          <div className="bg-[#2a2a2a] border-2 border-golden rounded-lg p-4 space-y-3">
            <h3 className="text-golden text-lg font-semibold text-center">Resumo da Aposta</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Ativo:</span>
                <span className="font-semibold">{betData.asset.symbol} - {betData.asset.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tipo de Ordem:</span>
                <span className="font-semibold">
                  {betData.orderType === 'market' ? 'Ordem a Mercado' : 'Ordem Limitada'}
                </span>
              </div>
              {betData.orderType === 'limit' && betData.targetPrice && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Preço Alvo:</span>
                  <span className="font-semibold text-golden">${parseFloat(betData.targetPrice).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Valor:</span>
                <span className="font-semibold">{formatCurrency(parseFloat(betData.amount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Alavancagem:</span>
                <span className="font-semibold">{betData.leverage}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Direção:</span>
                <span className={`font-semibold ${betData.direction === 'long' ? 'text-[#27c93f]' : 'text-[#e74c3c]'}`}>
                  {betData.direction === 'long' ? 'COMPRAR (LONG)' : 'VENDER (SHORT)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ganho Potencial:</span>
                <span className="font-semibold text-[#27c93f]">+{formatCurrency(betData.potentialGain)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Perda Potencial:</span>
                <span className="font-semibold text-[#e74c3c]">-{formatCurrency(betData.potentialLoss)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Taxas:</span>
                <span className="font-semibold">{formatCurrency(betData.fees)}</span>
              </div>
            </div>
            
            {/* Botão de Confirmação dentro do card de resumo */}
            <div className="pt-4 mt-4 border-t border-gray-700">
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={!canPlaceBet()}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                  canPlaceBet()
                    ? 'bg-golden text-black hover:bg-yellow-400 transform hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {betData.orderType === 'market' ? 'Confirmar Aposta' : 'Criar Ordem Limitada'}
              </button>
            </div>
          </div>
        )}
        
        {/* Botão de Confirmação fora do card (visível apenas quando não há resumo) */}
        {!(betData.asset && betData.amount && betData.direction) && (
          <button
            disabled={true}
            className="w-full py-4 rounded-lg font-bold text-lg bg-gray-600 text-gray-400 cursor-not-allowed"
          >
            {betData.orderType === 'market' ? 'Confirmar Aposta' : 'Criar Ordem Limitada'}
          </button>
        )}
      </div>

      {/* Modal de Confirmação */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-golden text-xl font-bold text-center mb-4">
              {betData.orderType === 'market' ? 'Confirmar Aposta' : 'Confirmar Ordem Limitada'}
            </h3>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Ativo:</span>
                <span className="font-semibold">{betData.asset?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tipo:</span>
                <span className="font-semibold">
                  {betData.orderType === 'market' ? 'Ordem a Mercado' : 'Ordem Limitada'}
                </span>
              </div>
              {betData.orderType === 'limit' && betData.targetPrice && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Preço Alvo:</span>
                  <span className="font-semibold text-golden">${parseFloat(betData.targetPrice).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Valor:</span>
                <span className="font-semibold">{formatCurrency(parseFloat(betData.amount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Direção:</span>
                <span className={`font-semibold ${betData.direction === 'long' ? 'text-[#27c93f]' : 'text-[#e74c3c]'}`}>
                  {betData.direction === 'long' ? 'COMPRAR (LONG)' : 'VENDER (SHORT)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Alavancagem:</span>
                <span className="font-semibold">{betData.leverage}x</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBet}
                className="py-3 bg-golden text-black hover:bg-yellow-400 rounded-lg font-semibold transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BetPage;

