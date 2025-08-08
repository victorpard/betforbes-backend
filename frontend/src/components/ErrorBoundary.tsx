import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualiza o estado para que a próxima renderização mostre a UI alternativa
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Você também pode registrar o erro em um serviço de relatório de erros
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleTryAgain = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    // Recarregar a página para tentar novamente
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI alternativa
      return (
        <div className="min-h-screen bg-[#1e1e1e] text-white flex items-center justify-center p-4">
          <div className="bg-[#2a2a2a] rounded-lg p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-[#e74c3c] text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-[#FFD700] mb-2">Ops! Algo deu errado</h2>
              <p className="text-gray-400 mb-4">
                Encontramos um problema ao carregar esta página.
              </p>
              {this.state.error && (
                <div className="bg-[#1e1e1e] p-3 rounded-lg text-left mb-4 overflow-auto max-h-40">
                  <p className="text-[#e74c3c] text-sm font-mono">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
              <button
                onClick={this.handleTryAgain}
                className="bg-[#FFD700] text-black py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
