import { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import { api } from '../../services/api.js';
import '../../styles/styles.css';
import '../../styles/admin.css';

export default function MenuPage() {
  const [metrics, setMetrics] = useState({
    enCaja: 0,
    enCocina: 0,
    totalPlatillos: 0,
    recaudado: 0
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      // Aquí llamarías a un endpoint de estadísticas que podrías crear
      // O hacer múltiples fetch a tus servicios actuales
      const { data, error } = await api.get('/api/pedido/dashboard-metrics');
      if (!error && data?.body) {
        setMetrics(data.body);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Actualiza cada 30 seg
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-content page-content--admin">
      <h1>Dashboard</h1>

      <div className="admin-dashboard__grid">
        {/* Cantidad en Caja: Pedidos esperando validación */}
        <Card title="En Caja" subtitle="Pendientes de Pago">
          <h2 className="kpi__value kpi__value--caja">{metrics.enCaja}</h2>
        </Card>

        {/* Cantidad en Cocina: Pedidos en preparación */}
        <Card title="En Cocina" subtitle="Platos en Cola">
          <h2 className="kpi__value kpi__value--cocina">{metrics.enCocina}</h2>
        </Card>

        {/* Total Platillos: Cantidad de items en el menú */}
        <Card title="Menú" subtitle="Platillos Registrados">
          <h2 className="kpi__value kpi__value--menu">{metrics.totalPlatillos}</h2>
        </Card>

        {/* Dinero Recaudado: Suma de pagos confirmados */}
        <Card title="Ganancias" subtitle="Ventas del Día">
          <h2 className="kpi__value kpi__value--ventas">
            ${metrics.recaudado.toFixed(2)}
          </h2>
        </Card>
      </div>
    </div>
  );
}