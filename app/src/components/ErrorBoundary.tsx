import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-Parchment dark:bg-Graphite flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-Rose/10 mb-6">
              <AlertTriangle size={32} className="text-Rose" />
            </div>

            <h1 className="font-display text-[2rem] font-semibold text-Ink dark:text-white mb-3">
              出错了
            </h1>

            <p className="font-body text-[1rem] leading-[1.65] text-Slate mb-6">
              抱歉，页面遇到了一些问题。请尝试刷新页面或返回首页。
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-Rose/5 border border-Rose/20 rounded-lg text-left">
                <p className="font-mono text-[0.75rem] text-Rose mb-2 font-semibold">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <pre className="font-mono text-[0.6875rem] text-Slate overflow-x-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-Amber text-Parchment text-[0.875rem] font-semibold hover:bg-[#B06A2F] transition-colors"
              >
                <RefreshCw size={16} />
                重新加载
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-Sand text-Ink text-[0.875rem] font-semibold hover:bg-Ink/5 transition-colors dark:border-white/20 dark:text-white dark:hover:bg-white/5"
              >
                <Home size={16} />
                返回首页
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
