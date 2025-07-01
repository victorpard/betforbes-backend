import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InviteFriendsModal from '../components/InviteFriendsModal';

interface Affiliate {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  totalBets: number;
  totalVolume: string;
  commission: string;
  status: 'active' | 'inactive';
}

const AfiliadosPage: React.FC = () => {
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Dados simulados de afiliados
  const affiliates: Affiliate[] = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@email.com',
      joinDate: '2024-01-15',
      totalBets: 45,
      totalVolume: 'R$ 12.500,00',
      commission: 'R$ 625,00',
      status: 'active'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@email.com',
      joinDate: '2024-02-03',
      totalBets: 28,
      totalVolume: 'R$ 8.200,00',
      commission: 'R$ 410,00',
      status: 'active'
    },
    {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro@email.com',
      joinDate: '2024-01-28',
      totalBets: 12,
      totalVolume: 'R$ 3.400,00',
      commission: 'R$ 170,00',
      status: 'inactive'
    }
  ];

  const totalCommissions = affiliates.reduce((sum, affiliate) => {
    return sum + parseFloat(affiliate.commission.replace('R$ ', '').replace('.', '').replace(',', '.'));
  }, 0);

  const totalVolume = affiliates.reduce((sum, affiliate) => {
    return sum + parseFloat(affiliate.totalVolume.replace('R$ ', '').replace('.', '').replace(',', '.'));
  }, 0);

  const activeAffiliates = affiliates.filter(a => a.status === 'active').length;

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-4 pt-8">
        <button
          onClick={() => navigate('/')}
          className="text-golden text-2xl hover:scale-110 transition-transform"
        >
          ←
        </button>
        <h1 className="text-golden text-2xl font-bold">Afiliados</h1>
        <div className="w-8"></div>
      </header>

      {/* Estatísticas Principais */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">👥</span>
              <span className="text-silver text-xs">ATIVOS</span>
            </div>
            <p className="text-silver text-sm">Afiliados Ativos</p>
            <p className="text-[#27c93f] text-2xl font-bold">{activeAffiliates}</p>
          </div>

          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💰</span>
              <span className="text-silver text-xs">GANHOS</span>
            </div>
            <p className="text-silver text-sm">Comissões Totais</p>
            <p className="text-golden text-2xl font-bold">R$ {totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-semibold">Performance Geral</h3>
            <span className="text-2xl">📊</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-silver text-sm">Volume Total Gerado</p>
              <p className="text-golden text-lg font-bold">R$ {totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-silver text-sm">Taxa de Comissão</p>
              <p className="text-[#27c93f] text-lg font-bold">5%</p>
            </div>
          </div>
        </div>

        {/* Botão de Convite */}
        <button
          onClick={() => setShowInviteModal(true)}
          className="w-full bg-gradient-to-r from-golden to-yellow-600 hover:from-yellow-500 hover:to-golden text-black font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg mb-6"
        >
          <span className="text-2xl">👥</span>
          <span className="text-lg">Convidar Novos Amigos</span>
          <span className="text-xl">💰</span>
        </button>

        {/* Lista de Afiliados */}
        <div className="mb-6">
          <h3 className="text-golden text-lg font-semibold mb-4">Meus Afiliados ({affiliates.length})</h3>
          
          <div className="space-y-3">
            {affiliates.map((affiliate) => (
              <div key={affiliate.id} className="bg-[#2a2a2a] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-golden to-yellow-600 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-sm">
                        {affiliate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{affiliate.name}</p>
                      <p className="text-silver text-sm">{affiliate.email}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    affiliate.status === 'active' 
                      ? 'bg-[#27c93f] bg-opacity-20 text-[#27c93f]' 
                      : 'bg-[#e74c3c] bg-opacity-20 text-[#e74c3c]'
                  }`}>
                    {affiliate.status === 'active' ? 'Ativo' : 'Inativo'}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-silver text-xs">Apostas</p>
                    <p className="text-white font-semibold">{affiliate.totalBets}</p>
                  </div>
                  <div>
                    <p className="text-silver text-xs">Volume</p>
                    <p className="text-golden font-semibold text-sm">{affiliate.totalVolume}</p>
                  </div>
                  <div>
                    <p className="text-silver text-xs">Comissão</p>
                    <p className="text-[#27c93f] font-semibold text-sm">{affiliate.commission}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#3a3a3a]">
                  <p className="text-silver text-xs">
                    Membro desde: {new Date(affiliate.joinDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informações sobre o Programa */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 mb-20">
          <h3 className="text-golden text-lg font-semibold mb-4">Como Funciona</h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="text-[#27c93f] text-lg">1.</span>
              <div>
                <p className="text-white font-semibold">Convide Amigos</p>
                <p className="text-silver text-sm">Compartilhe seu link de convite exclusivo</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="text-[#27c93f] text-lg">2.</span>
              <div>
                <p className="text-white font-semibold">Eles Apostam</p>
                <p className="text-silver text-sm">Seus amigos fazem apostas na plataforma</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="text-[#27c93f] text-lg">3.</span>
              <div>
                <p className="text-white font-semibold">Você Ganha</p>
                <p className="text-silver text-sm">Receba 5% de comissão vitalícia automaticamente</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Convite */}
      <InviteFriendsModal 
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  );
};

export default AfiliadosPage;

