import React, { useState } from 'react';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({ isOpen, onClose }) => {
  const [inviteLink] = useState('https://betforbes.com/ref/ABC123');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const message = `🎯 Venha apostar comigo no BetForbes! 💰\n\nGanhe dinheiro apostando em criptomoedas com a plataforma mais confiável do mercado.\n\n🚀 Use meu link e comece agora: ${inviteLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-golden text-2xl font-bold">Convidar Amigos</h2>
          <button
            onClick={onClose}
            className="text-silver hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Ícone e Título */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-white text-xl font-semibold mb-2">
            Ganhe Comissões Vitalícias!
          </h3>
        </div>

        {/* Explicação */}
        <div className="bg-[#1e1e1e] rounded-lg p-4 mb-6">
          <p className="text-silver text-sm leading-relaxed">
            <span className="text-golden font-semibold">Convide amigos</span>, acompanhe seus afiliados e 
            <span className="text-[#27c93f] font-semibold"> ganhe comissões vitalícias</span> a cada aposta feita por eles.
          </p>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[#27c93f]">✓</span>
              <span className="text-silver text-sm">5% de comissão em todas as apostas</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#27c93f]">✓</span>
              <span className="text-silver text-sm">Pagamentos automáticos</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#27c93f]">✓</span>
              <span className="text-silver text-sm">Sem limite de convites</span>
            </div>
          </div>
        </div>

        {/* Link de Convite */}
        <div className="mb-6">
          <label className="text-silver text-sm block mb-2">Seu Link de Convite:</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 bg-[#1e1e1e] text-white p-3 rounded-lg border border-[#3a3a3a] text-sm"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                copied 
                  ? 'bg-[#27c93f] text-white' 
                  : 'bg-golden text-black hover:bg-yellow-600'
              }`}
            >
              {copied ? '✓ Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Botões de Compartilhamento */}
        <div className="space-y-3">
          <button
            onClick={handleShareWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span className="text-xl">📱</span>
            <span>Compartilhar no WhatsApp</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span className="text-xl">🔗</span>
            <span>Copiar Link</span>
          </button>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="mt-6 pt-4 border-t border-[#3a3a3a]">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-golden text-xl font-bold">12</p>
              <p className="text-silver text-xs">Amigos Convidados</p>
            </div>
            <div>
              <p className="text-[#27c93f] text-xl font-bold">R$ 847,50</p>
              <p className="text-silver text-xs">Comissões Ganhas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsModal;

