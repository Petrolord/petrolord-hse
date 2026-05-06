import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ [ERROR BOUNDARY] Error caught:', error);
    console.error('❌ [ERROR BOUNDARY] Error info:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    console.log('🔄 [ERROR BOUNDARY] Resetting error boundary');
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-gray-800 border border-red-700 rounded-lg p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <h1 className="text-2xl font-bold">Something went wrong</h1>
              </div>

              <div className="bg-gray-950 rounded p-4 mb-6 max-h-48 overflow-auto border border-gray-700">
                <p className="text-sm text-red-300 font-mono font-medium">
                  {this.state.error?.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-4 text-xs text-gray-400">
                    <summary className="cursor-pointer font-semibold mb-2 hover:text-gray-300">
                      View Stack Trace
                    </summary>
                    <pre className="whitespace-pre-wrap break-words opacity-75">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={this.handleReset}
                  className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Application
                </Button>
                <Button
                  onClick={() => window.location.href = '/login'}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Return to Login
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                If the issue persists, please contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}