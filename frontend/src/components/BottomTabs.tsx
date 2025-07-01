import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BottomTabsProps {
  activeTab: string;
  onTabClick: (tab: string) => void;
}

const BottomTabs: React.FC<BottomTabsProps> = ({ activeTab, onTabClick }) => {
  const navigate = useNavigate();
  const tabs = ['Início', 'Criptos', 'Transações', 'Histórico', 'Ordens'];

  const handleTabClick = (tab: string) => {
    onTabClick(tab);
    
    // Navegação específica para certas abas
    if (tab === 'Histórico') {
      navigate('/historia');
    } else if (tab === 'Início') {
      navigate('/');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#2a2a2a] text-white flex justify-around py-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={`text-sm ${activeTab === tab ? 'text-golden' : 'text-silver'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default BottomTabs;
