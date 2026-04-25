import { useState } from 'react';
import './App.css';
import OrderForm from './components/OrderForm.jsx';
import OrderHistory from './components/OrderHistory.jsx';

function App() {
  const [refreshHistory, setRefreshHistory] = useState(0);

  return (
    <div className="app-shell">
      <header className="page-header">
        <div className="top-bar">
          <p className="brand">ATREUS</p>
          <nav className="site-nav">
            <a href="#">Inventario</a>
            <a href="#">Producción</a>
            <a href="#">Reportes y Métricas</a>
            <a href="#">Dasboard</a>
          </nav>
        </div>

        <div className="hero-copy">
          <div>

            <h1>Pedidos</h1>
            <p className="subtitle">
            </p>
          </div>
        </div>
      </header>

      <main>
        <OrderForm onOrderCreated={() => setRefreshHistory((prev) => prev + 1)} />
        <OrderHistory refresh={refreshHistory} />
      </main>
    </div>
  );
}

export default App;
