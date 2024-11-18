import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Hata yakalandı:", error);
    console.error("Hata bilgisi:", info);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Bir hata oluştu. Lütfen daha sonra tekrar deneyin.</h1>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
