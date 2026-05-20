import { useState, useEffect, useCallback } from 'react';
import DataTable from '../../components/Table.jsx';
import Notification from '../../components/Notification.jsx';
import Modal from '../../components/Modal.jsx';
import DynamicForm from '../../components/Form.jsx';
import { api } from '../../services/api.js';
import { cajaColumns } from '../../config/tableConfig.js';
import '../../styles/admin.css';

/**
 * CajaPage: Gestiona el cobro de pedidos pendientes.
 * Un pedido desaparece de aquí y aparece en cocina una vez pagado.
 */
export default function CajaPage() {
  const [pedidos, setPedidos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [notification, setNotification] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // ID de la caja actual (podría venir de un contexto de usuario/auth)
  const CAJA_ID = 1;

  // Función auxiliar para mostrar notificaciones temporales
  function showNotification(text, type) {
    setNotification({ text, type });
    setTimeout(() => setNotification({ text: '', type: '' }), 4000);
  }

  // 1. Obtener pedidos pendientes de cobro
  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await api.get(`/api/pedido/caja/${CAJA_ID}`);
    
    if (!error && data && data.body) {
      setPedidos(data.body);
    } else {
      setPedidos([]);
      if (error) {
        showNotification('Error al conectar con el servidor', 'error');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchPedidos();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchPedidos]);

  // 2. Preparar el pedido para el cobro
  const handleAbrirPago = (pedido) => {
    // Calculamos el total real sumando los precios de los detalles
    const total = pedido.detalles?.reduce((acc, item) => acc + Number(item.precio), 0) || 0;
    
    setPedidoSeleccionado({
      ...pedido,
      totalCalculado: total
    });
    setIsModalOpen(true);
  };

  // 3. Confirmar el pago en el servidor (Esto dispara el pedido a cocina)
  const confirmarPagoEnServidor = async (formData) => {
    // IMPORTANTE: Se usa PUT porque actualizamos el estado del pedido a 'PAGADO'
    const { error } = await api.put(
      `/api/pedido/confirmar/${pedidoSeleccionado.id}`, 
      {
        monto: formData.monto || pedidoSeleccionado.totalCalculado,
        metodo: formData.metodo,
        referencia: formData.referencia || "S/N"
      }
    );

    if (!error) {
      showNotification('✅ Cobro procesado exitosamente. El pedido ha sido enviado a cocina.', 'success');
      setIsModalOpen(false);
      setPedidoSeleccionado(null);
      fetchPedidos(); // Refrescamos la lista
    } else {
      showNotification(`❌ Error: ${error}`, 'error');
    }
  };

  return (
    <div className="page-content page-content--admin">
      <div className="header-caja caja__header">
        <div>
          <h1 className="caja__title">💰 Caja Registradora</h1>
          <p className="caja__subtitle">Gestión de cobros y facturación</p>
        </div>
        <div className="caja__pendientesBox">
          <span className="caja__pendientesLabel">PENDIENTES:</span>
          <h2 className="caja__pendientesValue">{pedidos.length}</h2>
        </div>
      </div>

      {loading ? (
        <p>Cargando pedidos...</p>
      ) : (
        <DataTable 
          columns={cajaColumns} 
          data={pedidos} 
          edit={handleAbrirPago} // Botón de acción (Pagar)
          onDelete={() => {}}    // Puedes implementar cancelar pedido si lo deseas
        />
      )}

      {/* Modal de Procesamiento de Pago */}
     <Modal 
  isOpen={isModalOpen} 
  onClose={() => setIsModalOpen(false)} 
  title="💸 Verificación de Pago"
>
  {pedidoSeleccionado && (
    <div className="modal-pago-container">
      {/* Resumen de la Orden */}
      <div className="caja-modal__resumen">
        <div className="caja-modal__resumenRow">
          <span><strong>Mesa:</strong> {pedidoSeleccionado.mesa}</span>
          <span><strong>Orden:</strong> #{pedidoSeleccionado.id}</span>
        </div>
        <div className="caja-modal__montoWrap">
          <span className="caja-modal__montoLabel">MONTO A VALIDAR</span>
          <div className="caja-modal__montoValue">
            ${pedidoSeleccionado.totalCalculado.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Datos reportados por el cliente (Si existen) */}
      {pedidoSeleccionado.pago && pedidoSeleccionado.pago.length > 0 ? (
        <div className="caja-modal__pagoReportado">
          <h4 className="caja-modal__pagoReportadoTitle">📋 Datos del Pago Reportado</h4>
          <p className="caja-modal__pagoReportadoItem"><strong>Método:</strong> {pedidoSeleccionado.pago[0].metodo_pago}</p>
          <p className="caja-modal__pagoReportadoItem"><strong>Referencia:</strong> {pedidoSeleccionado.pago[0].referencia || 'Sin referencia'}</p>
          <p className="caja-modal__pagoReportadoItem"><strong>Fecha/Hora:</strong> 11-03-2025</p>
        </div>
      ) : (
        <div className="caja-modal__sinPago">
          <p className="caja-modal__sinPagoText">⚠️ Este pedido no tiene datos de pago adjuntos.</p>
        </div>
      )}

      {/* Botón de acción simple */}
      <div className="caja-modal__actions">
        <button 
          onClick={() => confirmarPagoEnServidor({})} // Mandamos objeto vacío porque el backend ya tiene los datos
          className="caja-modal__btnPrimary"
        >
          ✅ Validar y Enviar a Cocina
        </button>
        <button 
          onClick={() => setIsModalOpen(false)}
          className="caja-modal__btnSecondary"
        >
          Cancelar
        </button>
      </div>
    </div>
  )}
</Modal>

      {/* Sistema de notificaciones */}
      {notification.text && (
        <Notification text={notification.text} type={notification.type} />
      )}
    </div>
  );
}