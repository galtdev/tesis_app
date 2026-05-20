import { useOutletContext, useNavigate } from 'react-router-dom';
import DynamicForm from '../../components/Form.jsx';
import { camposPedido } from '../../config/formConfig.js';
import Button from '../../components/Button.jsx';
import '../../styles/client.css';

export default function DataPedidoPage() {
  const { orderData, updateOrder } = useOutletContext();
  const navigate = useNavigate();

  // Calculamos el total (Lógica intacta)
  const total = orderData.step1.reduce((acc, p) => acc + Number(p.precio), 0);

  const handleFormSubmit = (formData) => {
    updateOrder('step2', formData);
    navigate('/menu/pago');
  };

  return (
    <div className="page-content client-narrow client-narrow--600">
      <header className="client-header">
        <h1 className="client-header__title">📍 Datos de Entrega</h1>
        <p className="client-header__subtitle">Casi terminamos. Dinos dónde llevaremos tu comida.</p>
      </header>

      <div className="client-grid">
        
        {/* Resumen de Selección Estilizado */}
        <section className="client-card client-card--shadow client-card__pad25">
          <h3 className="client-selection__title">
            Tu Selección ({orderData.step1.length})
          </h3>

          <div className="client-selection__list">
            {orderData.step1.map((p, idx) => (
              <div key={idx} className="client-selection__row">
                <span className="client-selection__name">{p.nombre_platillo}</span>
                <span className="client-selection__price">${Number(p.precio).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="client-selection__totalRow">
            <span className="client-selection__totalLabel">Total Acumulado:</span>
            <span className="client-selection__totalValue">
              ${total.toFixed(2)}
            </span>
          </div>
        </section>

        {/* Contenedor del Formulario Dinámico */}
        <section className="client-card client-card--muted client-card__pad30">
          <div className="client-formHeader">
            <h4 className="client-formHeader__title">Información del Cliente</h4>
            <p className="client-formHeader__subtitle">Completa los campos para continuar.</p>
          </div>

          <DynamicForm 
            fields={camposPedido} 
            onSubmit={handleFormSubmit} 
            buttonText="Ir al Paso de Pago →"
          />
          
          <button 
            onClick={() => navigate('/menu')} 
            className="client-linkBtn"
          >
            ← Volver al Menú para agregar más
          </button>
        </section>

      </div>

      <footer className="client-footer">
        Paso 2 de 3 • Información y Ubicación
      </footer>
    </div>
  );
}