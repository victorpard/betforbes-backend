import React from 'react';

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: string;
  content: {
    type: 'development' | 'info' | 'success';
    message: string;
    details?: string[];
  };
}

const GenericModal: React.FC<GenericModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  icon, 
  content 
}) => {
  if (!isOpen) return null;

  const getContentStyle = () => {
    switch (content.type) {
      case 'development':
        return {
          bgColor: 'bg-blue-500 bg-opacity-20 border-blue-500',
          textColor: 'text-blue-400',
          iconBg: 'bg-blue-500'
        };
      case 'success':
        return {
          bgColor: 'bg-[#27c93f] bg-opacity-20 border-[#27c93f]',
          textColor: 'text-[#27c93f]',
          iconBg: 'bg-[#27c93f]'
        };
      default:
        return {
          bgColor: 'bg-gray-500 bg-opacity-20 border-gray-500',
          textColor: 'text-gray-400',
          iconBg: 'bg-gray-500'
        };
    }
  };

  const styles = getContentStyle();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#FFD700]">{icon} {title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="text-center space-y-4">
          <div className={`w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center mx-auto`}>
            <span className="text-white text-2xl">{icon}</span>
          </div>

          <div className={`border rounded-lg p-4 ${styles.bgColor}`}>
            <p className={`${styles.textColor} font-semibold mb-2`}>{content.message}</p>
            
            {content.details && (
              <ul className={`${styles.textColor} text-sm space-y-1 text-left`}>
                {content.details.map((detail, index) => (
                  <li key={index}>• {detail}</li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[#FFD700] text-black py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenericModal;

