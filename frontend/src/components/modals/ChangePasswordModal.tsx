import React, { useState } from 'react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleSave = async () => {
    setError('');
    
    // Validações
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setError('Todos os campos são obrigatórios');
      return;
    }
    
    if (passwords.new.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    if (passwords.new !== passwords.confirm) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    
    // Simular alteração de senha
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSuccess(true);
    setLoading(false);
    
    setTimeout(() => {
      setSuccess(false);
      setPasswords({ current: '', new: '', confirm: '' });
      onClose();
    }, 2000);
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#FFD700]">🔒 Alterar Senha</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔐</div>
            <p className="text-[#27c93f] text-lg font-semibold">Senha alterada com sucesso!</p>
            <p className="text-gray-400 text-sm mt-2">Sua conta está mais segura agora</p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="bg-[#e74c3c] bg-opacity-20 border border-[#e74c3c] rounded-lg p-3">
                <p className="text-[#e74c3c] text-sm">⚠️ {error}</p>
              </div>
            )}

            {/* Senha Atual */}
            <div>
              <label className="block text-gray-300 mb-2">Senha Atual</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white focus:border-[#FFD700] focus:outline-none"
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.current ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Nova Senha */}
            <div>
              <label className="block text-gray-300 mb-2">Nova Senha</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white focus:border-[#FFD700] focus:outline-none"
                  placeholder="Digite sua nova senha"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.new ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-1">Mínimo 6 caracteres</p>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-gray-300 mb-2">Confirmar Nova Senha</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                  className="w-full bg-[#1e1e1e] border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white focus:border-[#FFD700] focus:outline-none"
                  placeholder="Confirme sua nova senha"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.confirm ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-[#FFD700] text-black py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                ) : (
                  'Alterar Senha'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;

