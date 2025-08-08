import React, { useState } from 'react';
import PremiumHeader from '../components/PremiumHeader';
import PremiumBalanceCard from '../components/PremiumBalanceCard';
import StatsCards from '../components/StatsCards';
import PremiumActionButtons from '../components/PremiumActionButtons';
import InviteFriendsModal from '../components/InviteFriendsModal';
import DepositModal from '../components/modals/DepositModal';
import WithdrawModal from '../components/modals/WithdrawModal';

const PremiumDashboardPage: React.FC = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleDeposit = () => {
    setShowDepositModal(true);
  };

  const handleWithdraw = () => {
    setShowWithdrawModal(true);
  };

  const handleInviteFriends = () => {
    setShowInviteModal(true);
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white pb-20">
      {/* Header Premium */}
      <PremiumHeader 
        userName="Usuário"
        notificationCount={3}
      />

      {/* Conteúdo principal */}
      <main className="flex-grow">
        {/* Saldo e P&L */}
        <PremiumBalanceCard 
          balance="R$ 12.700,00"
          pnl="+R$ 2.150,00"
          isPositivePnl={true}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
        />

        {/* Cards de Resumo */}
        <StatsCards 
          totalBet="R$ 8.500,00"
          totalWins={12}
          winRate={75.5}
        />

        {/* Ações Rápidas */}
        <PremiumActionButtons 
          onInviteFriends={handleInviteFriends}
        />
      </main>

      {/* Modais */}
      <InviteFriendsModal 
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

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

export default PremiumDashboardPage;
