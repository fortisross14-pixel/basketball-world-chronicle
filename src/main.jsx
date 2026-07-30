import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class ChronicleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Basketball World Chronicle render failure', error, info);
  }

  render() {
    if (this.state.error) {
      return <div className="loading-screen error-screen">
        <div className="kicker">Basketball World Chronicle</div>
        <h1>The screen encountered an error.</h1>
        <p>The game autosaves each simulation and offseason action in the active save slot. Reload the page and continue from the home screen.</p>
        <pre>{String(this.state.error.message || this.state.error)}</pre>
        <button className="button primary" onClick={() => window.location.reload()}>Reload saved game</button>
      </div>;
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChronicleErrorBoundary>
      <App />
    </ChronicleErrorBoundary>
  </React.StrictMode>,
);
