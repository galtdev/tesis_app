import { useState, useEffect, useCallback } from 'react';
import Notification from '../../components/Notification.jsx';
import CocinaCard from '../../components/CocinaCard.jsx';
import { api } from '../../services/api.js';
import '../../styles/admin.css';

export default function CocinaPage() {
  const [pedidosAgrupados, setPedidosAgrupados] = useState([]);
  const [notification, setNotification] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  const agruparPorPedido = (platos) => {
    if (!platos) return [];
    const grupos = platos.reduce((acc, item) => {
      const pId = item.pedido?.id || 'sin-id';
      if (!acc[pId]) {
        acc[pId] = {
          id: pId,
          mesa: item.pedido?.mesa || 'Sin Mesa',
          tipo_pedido: item.pedido?.tipo_pedido || 'Local',
          items: []
        };
      }

      acc[pId].items.push(item);
      return acc;
    }, {});
    console.log(grupos)
    return Object.values(grupos);
  };

  const fetchComandas = useCallback(async () => {
    try {
      const { data, error } = await api.get('/api/pedido/cocina/1'); 
      if (!error && data?.body) {
        setPedidosAgrupados(agruparPorPedido(data.body));
      }
    } catch (err) {
      console.error("Error en fetchComandas", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComandas();
    const interval = setInterval(fetchComandas, 10000); 
    return () => clearInterval(interval);
  }, [fetchComandas]);

  const terminarPedidoCompleto = async (pedidoId) => {
    const { error } = await api.put(`/api/pedido/confirmar-entrega/${pedidoId}`);
    
    if (!error) {
      setNotification({ text: '¡Orden completada!', type: 'success' });
      fetchComandas();
    } else {
      setNotification({ text: 'Error al completar orden', type: 'error' });
    }
    setTimeout(() => setNotification({ text: '', type: '' }), 3000);
  };

  return (
    <div className="page-content cocina-page">
      <div className="cocina__header">
        <h1 className="cocina__title">👨‍🍳 Panel de Cocina</h1>
        <p className="cocina__subtitle">Comandas activas listas para preparar</p>
      </div>

      {loading ? (
        <p>Cargando comandas...</p>
      ) : (
        <div className="cocina__grid">
          {pedidosAgrupados.length > 0 ? (
            pedidosAgrupados.map(pedido => (
              <CocinaCard 
                key={pedido.id} 
                pedido={pedido} 
                onCompletar={terminarPedidoCompleto} 
              />
            ))
          ) : (
            <div className="cocina__empty">
              <h2 className="cocina__emptyTitle">No hay pedidos por preparar 😴</h2>
            </div>
          )}
        </div>
      )}

      {notification.text && <Notification text={notification.text} type={notification.type} />}
    </div>
  );
}