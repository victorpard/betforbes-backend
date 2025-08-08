import React, { useState } from 'react';

interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
  browser: string;
  os: string;
}

interface ActiveSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ActiveSessionsModal: React.FC<ActiveSessionsModalProps> = ({ isOpen, onClose }) => {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'iPhone 14 Pro',
      location: 'São Paulo, SP',
      ip: '192.168.1.100',
      lastActive: 'Agora',
      current: true,
      browser: 'Safari',
      os: 'iOS 17.1'
    },
    {
      id: '2',
      device: 'MacBook Pro',
      location: 'São Paulo, SP',
      ip: '192.168.1.101',
      lastActive: '2 horas atrás',
      current: false,
      browser: 'Chrome',
      os: 'macOS 14.1'
    },
    {
      id: '3',
      device: 'Windows PC',
      location: 'Rio de Janeiro, RJ',
      ip: '201.45.123.45',
      lastActive: '1 dia atrás',
      current: false,
      browser: 'Edge',
      os: 'Windows 11'
    },
    {
      id: '4',
      device: 'Android Phone',
      location: 'Brasília, DF',
      ip: '179.123.45.67',
      lastActive: '3 dias atrás',
      current: false,
      browser: 'Chrome Mobile',
      os: 'Android 13'
    }
  ]);

  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleTerminateSession = async (sessionId: string) => {
    setLoading(sessionId);
    
    // Simular terminação da sessão
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    setSuccess(sessionId);
    setLoading(null);
    
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleTerminateAll = async () => {
    setLoading('all');
    
    // Simular terminação de todas as sessões
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSessions(prev => prev.filter(session => session.current));
    setSuccess('all');
    setLoading(null);
    
    setTimeout(() => setSuccess(null), 2000);
  };

  const getDeviceIcon = (device: string) => {
    if (device.includes('iPhone') || device.includes('Android')) return '📱';
    if (device.includes('MacBook') || device.includes('Mac')) return '💻';
    if (device.includes('Windows') || device.includes('PC')) return '🖥️';
    return '📱';
  };

  const getLocationIcon = (location: string) => {
    if (location.includes('São Paulo')) return '🏙️';
    if (location.includes('Rio de Janeiro')) return '🏖️';
    if (location.includes('Brasília')) return '🏛️';
    return '📍';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#FFD700]">📱 Sessões Ativas</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Estatísticas */}
          <div className="bg-[#1e1e1e] rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Total de Sessões</p>
                <p className="text-white text-2xl font-bold">{sessions.length}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Sessão Atual</p>
                <p className="text-[#27c93f] text-lg font-semibold">✅ Ativa</p>
              </div>
              <button
                onClick={handleTerminateAll}
                disabled={loading === 'all' || sessions.length <= 1}
                className="bg-[#e74c3c] text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading === 'all' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>🚪 Encerrar Outras</>
                )}
              </button>
            </div>
          </div>

          {/* Lista de Sessões */}
          <div className="space-y-3">
            {sessions.map((session) => (
              <div 
                key={session.id}
                className={`bg-[#1e1e1e] rounded-lg p-4 border-l-4 ${
                  session.current ? 'border-[#27c93f]' : 'border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{getDeviceIcon(session.device)}</span>
                      <h3 className="text-white font-semibold">{session.device}</h3>
                      {session.current && (
                        <span className="bg-[#27c93f] text-black text-xs px-2 py-1 rounded-full font-semibold">
                          ATUAL
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <span>{getLocationIcon(session.location)}</span>
                        <span>{session.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <span>🌐</span>
                        <span>{session.ip}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <span>🕒</span>
                        <span>{session.lastActive}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <span>💻</span>
                        <span>{session.browser} • {session.os}</span>
                      </div>
                    </div>
                  </div>

                  {!session.current && (
                    <button
                      onClick={() => handleTerminateSession(session.id)}
                      disabled={loading === session.id}
                      className="bg-[#e74c3c] text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                    >
                      {loading === session.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <>🚪 Encerrar</>
                      )}
                    </button>
                  )}
                </div>

                {success === session.id && (
                  <div className="mt-2 text-[#27c93f] text-sm">
                    ✅ Sessão encerrada com sucesso
                  </div>
                )}
              </div>
            ))}
          </div>

          {success === 'all' && (
            <div className="bg-[#27c93f] bg-opacity-20 border border-[#27c93f] rounded-lg p-3">
              <p className="text-[#27c93f] text-sm">✅ Todas as outras sessões foram encerradas</p>
            </div>
          )}

          {/* Informações de Segurança */}
          <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">🔒 Dicas de Segurança</h4>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Encerre sessões em dispositivos que não reconhece</li>
              <li>• Verifique regularmente suas sessões ativas</li>
              <li>• Use sempre redes seguras para acessar sua conta</li>
              <li>• Ative a autenticação de dois fatores para maior segurança</li>
            </ul>
          </div>

          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="w-full bg-[#FFD700] text-black py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveSessionsModal;

