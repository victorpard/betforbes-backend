import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DepositModal from '../components/modals/DepositModal';
import WithdrawModal from '../components/modals/WithdrawModal';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'commission';
  amount: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

const TransacoesPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Dados simulados de transações
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'deposit',
      amount: '+R$ 5.000,00',
      description: 'Depósito via PIX',
      date: '2024-06-10 14:30',
      status: 'completed'
    },
    {
      id: '2',
      type: 'bet',
      amount: '-R$ 1.500,00',
      description: 'Aposta BTC/USD - LONG',
      date: '2024-06-10 13:15',
      status: 'completed'
    },
    {
      id: '3',
      type: 'win',
      amount: '+R$ 2.250,00',
      description: 'Ganho BTC/USD - LONG',
      date: '2024-06-10 13:45',
      status: 'completed'
    },
    {
      id: '4',
      type: 'commission',
      amount: '+R$ 125,00',
      description: 'Comissão de afiliado - João Silva',
      date: '2024-06-10 12:00',
      status: 'completed'
    },
    {
      id: '5',
      type: 'withdrawal',
      amount: '-R$ 2.000,00',
      description: 'Saque via PIX',
      date: '2024-06-10 10:30',
      status: 'pending'
    },
    {
      id: '6',
      type: 'bet',
      amount: '-R$ 800,00',
      description: 'Aposta ETH/USD - SHORT',
      date: '2024-06-09 16:20',
      status: 'completed'
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdrawal': return '💸';
      case 'bet': return '🎯';
      case 'win': return '🏆';
      case 'commission': return '👥';
      default: return '💳';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'win':
      case 'commission':
        return 'text-[#27c93f]';
      case 'withdrawal':
      case 'bet':
        return 'text-[#e74c3c]';
      default:
        return 'text-silver';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-[#27c93f] bg-[#27c93f] bg-opacity-20';
      case 'pending': return 'text-golden bg-golden bg-opacity-20';
      case 'failed': return 'text-[#e74c3c] bg-[#e74c3c] bg-opacity-20';
      default: return 'text-silver bg-[#3a3a3a]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      default: return 'Desconhecido';
    }
  };

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filter);

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
        <h1 className="text-golden text-2xl font-bold">Transações</h1>
        <div className="w-8"></div>
      </header>

      {/* Resumo */}
      <div className="px-4 mt-4">
        <div className="bg-[#2a2a2a] rounded-lg p-4 mb-6">
          <h3 className="text-white text-lg font-semibold mb-4">Resumo do Mês</h3>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[#27c93f] text-xl font-bold">+R$ 7.375,00</p>
              <p className="text-silver text-xs">Entradas</p>
            </div>
            <div>
              <p className="text-[#e74c3c] text-xl font-bold">-R$ 4.300,00</p>
              <p className="text-silver text-xs">Saídas</p>
            </div>
            <div>
              <p className="text-golden text-xl font-bold">+R$ 3.075,00</p>
              <p className="text-silver text-xs">Saldo</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <h3 className="text-golden text-lg font-semibold mb-3">Filtrar por:</h3>
          
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Todas', icon: '📋' },
              { key: 'deposit', label: 'Depósitos', icon: '💰' },
              { key: 'withdrawal', label: 'Saques', icon: '💸' },
              { key: 'bet', label: 'Apostas', icon: '🎯' },
              { key: 'win', label: 'Ganhos', icon: '🏆' },
              { key: 'commission', label: 'Comissões', icon: '👥' }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                  filter === filterOption.key
                    ? 'bg-golden text-black'
                    : 'bg-[#3a3a3a] text-silver hover:bg-[#4a4a4a]'
                }`}
              >
                <span>{filterOption.icon}</span>
                <span>{filterOption.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="space-y-3">
          <h3 className="text-white text-lg font-semibold">
            Histórico ({filteredTransactions.length})
          </h3>
          
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                  <div>
                    <p className="text-white font-semibold">{transaction.description}</p>
                    <p className="text-silver text-sm">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                    {transaction.amount}
                  </p>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                    {getStatusText(transaction.status)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botões de Ação */}
        <div className="mt-8 space-y-3">
          <button 
            onClick={() => setShowDepositModal(true)}
            className="w-full bg-[#27c93f] hover:bg-[#22a835] text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span className="text-xl">💰</span>
            <span>Fazer Depósito</span>
          </button>
          
          <button 
            onClick={() => setShowWithdrawModal(true)}
            className="w-full bg-[#e74c3c] hover:bg-[#c0392b] text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span className="text-xl">💸</span>
            <span>Solicitar Saque</span>
          </button>
        </div>
      </div>

      {/* Modais */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        availableBalance="R$ 12.700,00"
      />
    </div>
  );
};

export default TransacoesPage;

