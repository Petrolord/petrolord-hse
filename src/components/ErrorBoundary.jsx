import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemedApp, readLastTheme } from '@/design/ThemeProvider';
import { DEFAULT_THEME } from '@/design/tokens';

// The root boundary wraps the whole app, above the router and the auth
// provider, so its panel sits outside every scope and opens its own
// (docs/scope/DesignSystem-Rollout.md section 4.2, batch 3A). The signed-in
// user is not known up here, so the panel paints the theme this device
// last resolved (petrolord.theme.v1.last), light when there is none: a dark
// user does not get a light flash when a page fails.

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
        <ThemedApp
          defaultTheme={readLastTheme() || DEFAULT_THEME}
          data-testid="error-boundary-panel"
          className="min-h-screen flex items-center justify-center p-4 text-pl-text"
        >
          <div className="max-w-md w-full">
            <div className="bg-pl-raised border border-pl-danger/40 rounded-lg p-6 shadow-pl-lg">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-8 h-8 text-pl-danger-text" aria-hidden="true" />
                <h1 className="font-pl-display text-2xl font-semibold text-pl-text">Something went wrong</h1>
              </div>

              <div className="bg-pl-sunken rounded p-4 mb-6 max-h-48 overflow-auto border border-pl-border">
                <p className="text-sm text-pl-danger-text font-pl-mono font-medium break-words">
                  {this.state.error?.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-4 text-xs text-pl-muted">
                    <summary className="cursor-pointer font-semibold mb-2 hover:text-pl-text">
                      View Stack Trace
                    </summary>
                    <pre className="whitespace-pre-wrap break-words font-pl-mono">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={this.handleReset}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Reload Application
                </Button>
                <Button
                  onClick={() => window.location.href = '/login'}
                  variant="outline"
                  className="w-full"
                >
                  Return to Login
                </Button>
              </div>

              <p className="text-xs text-pl-muted mt-4 text-center">
                If the issue persists, please contact support.
              </p>
            </div>
          </div>
        </ThemedApp>
      );
    }

    return this.props.children;
  }
}
