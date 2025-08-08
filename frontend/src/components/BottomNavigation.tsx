import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'home',
      label: 'Início',
      icon: '🏠',
      path: '/'
    },
    {
      id: 'transactions',
      label: 'Transações',
      icon: '💳',
      path: '/transacoes'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: '⚙️',
      path: '/configuracoes'
    },
    {
      id: 'affiliates',
      label: 'Afiliados',
      icon: '👥',
      path: '/afiliados'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#2a2a2a] border-t border-[#3a3a3a] px-4 py-2 z-40">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-golden bg-opacity-20 text-golden' 
                  : 'text-silver hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;

