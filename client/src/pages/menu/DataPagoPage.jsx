import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { camposPago } from '../../config/formConfig.js';
import DynamicForm from '../../components/Form.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx'; // 👈 Importamos tu componente
import '../../styles/client.css';

export default function DataPagoPage() {
  const { orderData, resetOrder } = useOutletContext();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalMonto = orderData.step1.reduce((acc, p) => acc + Number(p.precio), 0);

  const finalizarPedido = async (dataPago) => {
    setLoading(true);
    const pedidoFinal = {
      mesa: `Mesa ${orderData.step2.numero_mesa}`,
      tipo_pedido: orderData.step2.tipo_servicio,
      status_pago: "POR_VERIFICAR",
      cedula: orderData.step2.cedula,
      nombre_cliente: orderData.step2.nombre_cliente,
      telefono: orderData.step2.telefono,
      cajaId: 1, 
      cocinaId: 1, 
      productos: orderData.step1.map(p => ({
        id: p.id,
        nombre_platillo: p.nombre_platillo,
        precio: p.precio
      })),
      pago: {
        monto: totalMonto,
        metodo: dataPago.metodo,
        referencia: dataPago.referencia
      }
    };

    try {
      const { error } = await api.post('/api/pedido', pedidoFinal);
      if (!error) {
        setIsModalOpen(true); // 👈 Abrimos tu modal
      } else {
        alert("❌ Error al procesar el pedido.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const confirmarYSalir = () => {
    setIsModalOpen(false);
    resetOrder(); 
    navigate('/menu'); 
  };

  return (
    <div className="page-content client-narrow client-narrow--550">
      
      {/* USO DE TU COMPONENTE MODAL */}
      <Modal isOpen={isModalOpen} onClose={confirmarYSalir}>
        <div className="checkout-modal">
          <div className="checkout-modal__icon">✅</div>
          <h2 className="checkout-modal__title">¡Todo listo!</h2>
          <p className="checkout-modal__text">
            Tu pedido ha sido recibido con éxito. En breve comenzaremos a prepararlo.
          </p>
          <Button onClick={confirmarYSalir}>
            Entendido
          </Button>
        </div>
      </Modal>

      <header className="client-header client-header--mb35">
        <h1 className="client-header__title">Checkout</h1>
        <div className="checkout__divider"></div>
      </header>

      {/* Recibo de Orden */}
      <div className="checkout__receipt">
        <div className="checkout__row">
          <span className="checkout__labelMuted">Resumen para:</span>
          <span className="checkout__valueStrong">{orderData.step2.nombre_cliente}</span>
        </div>
        <div className="checkout__row checkout__row--mb20">
          <span className="checkout__labelMuted">Ubicación:</span>
          <span className="checkout__valueStrong">Mesa {orderData.step2.numero_mesa}</span>
        </div>
        <div className="checkout__totalRow">
          <span className="checkout__totalLabel">Total</span>
          <span className="checkout__totalValue">${totalMonto.toFixed(2)}</span>
        </div>
      </div>

      {/* Formulario */}
      <div className="client-card client-card--muted client-card__pad30">
        <DynamicForm 
          fields={camposPago} 
          onSubmit={finalizarPedido} 
          buttonText={loading ? "Enviando..." : `Confirmar y Pagar $${totalMonto.toFixed(2)}`}
          disabled={loading}
        />
        <button 
          onClick={() => navigate(-1)} 
          className="client-linkBtn"
        >
          Volver atrás
        </button>
      </div>
    </div>
  );
}