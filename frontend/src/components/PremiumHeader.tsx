import React from 'react';

interface PremiumHeaderProps {
  userName?: string;
  notificationCount?: number;
}

const PremiumHeader: React.FC<PremiumHeaderProps> = ({ 
  userName = "Usuário", 
  notificationCount = 0 
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="flex justify-between items-center p-4 pt-8">
      {/* Avatar */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-golden to-yellow-600 rounded-full flex items-center justify-center">
          <span className="text-black font-bold text-lg">
            {getInitials(userName)}
          </span>
        </div>
      </div>

      {/* Logo Central */}
      <h1 className="text-golden text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
        BETFORBES
      </h1>

      {/* Notificações */}
      <div className="relative">
        <div className="text-golden text-2xl cursor-pointer hover:scale-110 transition-transform">
          🔔
        </div>
        {notificationCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notificationCount > 9 ? '9+' : notificationCount}
          </div>
        )}
      </div>
    </header>
  );
};

export default PremiumHeader;
