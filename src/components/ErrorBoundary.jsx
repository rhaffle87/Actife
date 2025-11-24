import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can log to an external service here
    console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <pre className="text-xs text-left max-w-3xl mx-auto p-2 bg-gray-100 rounded">{String(this.state.error && this.state.error.stack ? this.state.error.stack : this.state.error)}</pre>
          <button onClick={() => this.setState({ hasError: false, error: null })} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Dismiss</button>
        </div>
      );
    }
    return this.props.children;
  }
}
