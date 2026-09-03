import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo)
  }

  handleReload = () => {
    // Limpa cache básico do SW se necessário e recarrega
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name))
      }).finally(() => {
        window.location.reload()
      })
    } else {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-slate-50 flex items-center justify-center p-5">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-xl border border-rose-100 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800">Ops! Algo deu errado</h2>
              <p className="text-xs text-slate-500">
                O aplicativo encontrou uma instabilidade momentânea ao carregar.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 rounded-xl p-3 text-left border border-slate-200">
                <p className="text-[11px] font-mono text-rose-600 break-all">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 bg-rose-500 hover:bg-rose-600 active:scale-98 text-white rounded-xl font-semibold text-sm shadow-md shadow-rose-200 flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar Aplicativo
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
