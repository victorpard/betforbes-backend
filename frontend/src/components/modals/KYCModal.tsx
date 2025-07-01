import React, { useState } from 'react';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KYCModal: React.FC<KYCModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [documents, setDocuments] = useState({
    identity: null as File | null,
    address: null as File | null,
    selfie: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = (type: keyof typeof documents, file: File) => {
    setDocuments(prev => ({ ...prev, [type]: file }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Simular upload e verificação
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setSuccess(true);
    setLoading(false);
    
    setTimeout(() => {
      setSuccess(false);
      setCurrentStep(1);
      setDocuments({ identity: null, address: null, selfie: null });
      onClose();
    }, 3000);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#FFD700]">✅ Verificação KYC</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-[#27c93f] text-lg font-semibold">Documentos enviados com sucesso!</p>
            <p className="text-gray-400 text-sm mt-2">Analisaremos em até 24 horas</p>
          </div>
        ) : loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFD700] border-t-transparent mx-auto mb-4"></div>
            <p className="text-[#FFD700] text-lg font-semibold">Enviando documentos...</p>
            <p className="text-gray-400 text-sm mt-2">Por favor, aguarde</p>
          </div>
        ) : (
          <div>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Passo {currentStep} de 3</span>
                <span>{Math.round((currentStep / 3) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-[#FFD700] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Step 1: Documento de Identidade */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🆔</div>
                  <h3 className="text-lg font-semibold text-white">Documento de Identidade</h3>
                  <p className="text-gray-400 text-sm">RG, CNH ou Passaporte</p>
                </div>

                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  {documents.identity ? (
                    <div className="text-[#27c93f]">
                      <div className="text-2xl mb-2">📄</div>
                      <p className="font-semibold">{documents.identity.name}</p>
                      <p className="text-sm text-gray-400">{(documents.identity.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="text-4xl mb-2">📤</div>
                      <p className="text-white font-semibold">Clique para enviar</p>
                      <p className="text-gray-400 text-sm">PNG, JPG até 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('identity', e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-3">
                  <p className="text-blue-400 text-sm">💡 Certifique-se de que o documento esteja legível e dentro da validade</p>
                </div>
              </div>
            )}

            {/* Step 2: Comprovante de Endereço */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🏠</div>
                  <h3 className="text-lg font-semibold text-white">Comprovante de Endereço</h3>
                  <p className="text-gray-400 text-sm">Conta de luz, água ou telefone</p>
                </div>

                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  {documents.address ? (
                    <div className="text-[#27c93f]">
                      <div className="text-2xl mb-2">📄</div>
                      <p className="font-semibold">{documents.address.name}</p>
                      <p className="text-sm text-gray-400">{(documents.address.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="text-4xl mb-2">📤</div>
                      <p className="text-white font-semibold">Clique para enviar</p>
                      <p className="text-gray-400 text-sm">PNG, JPG até 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('address', e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-3">
                  <p className="text-blue-400 text-sm">💡 O comprovante deve ter no máximo 3 meses</p>
                </div>
              </div>
            )}

            {/* Step 3: Selfie */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🤳</div>
                  <h3 className="text-lg font-semibold text-white">Selfie com Documento</h3>
                  <p className="text-gray-400 text-sm">Você segurando seu documento</p>
                </div>

                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  {documents.selfie ? (
                    <div className="text-[#27c93f]">
                      <div className="text-2xl mb-2">📷</div>
                      <p className="font-semibold">{documents.selfie.name}</p>
                      <p className="text-sm text-gray-400">{(documents.selfie.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="text-4xl mb-2">📤</div>
                      <p className="text-white font-semibold">Clique para enviar</p>
                      <p className="text-gray-400 text-sm">PNG, JPG até 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('selfie', e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-3">
                  <p className="text-blue-400 text-sm">💡 Segure o documento próximo ao rosto, em local bem iluminado</p>
                </div>
              </div>
            )}

            {/* Botões de Navegação */}
            <div className="flex gap-3 pt-6">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Voltar
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && !documents.identity) ||
                    (currentStep === 2 && !documents.address)
                  }
                  className="flex-1 bg-[#FFD700] text-black py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!documents.selfie}
                  className="flex-1 bg-[#27c93f] text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enviar Documentos
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCModal;

