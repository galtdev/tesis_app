import { useOutletContext, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import '../../styles/client.css';

export default function ResumenPedido() {
  const { orderData, updateOrder } = useOutletContext();
  const navigate = useNavigate();

  // Agrupamos visualmente para la tabla
  const platosAgrupados = orderData.step1.reduce((acc, p) => {
    const encontrado = acc.find(item => item.id === p.id);
    if (encontrado) {
      encontrado.cantidadVista += 1;
    } else {
      acc.push({ ...p, cantidadVista: 1 });
    }
    return acc;
  }, []);

  const montoTotal = orderData.step1.reduce((acc, p) => acc + Number(p.precio), 0);

  const sumarPlato = (platoBase) => {
    const { cantidadVista: _cantidadVista, ...soloPlato } = platoBase;
    updateOrder('step1', [...orderData.step1, soloPlato]);
  };

  const restarPlato = (id) => {
    const index = orderData.step1.findIndex(p => p.id === id);
    if (index !== -1) {
      const nuevoCarrito = [...orderData.step1];
      nuevoCarrito.splice(index, 1);
      updateOrder('step1', nuevoCarrito);
    }
  };

  const eliminarTodo = (id) => {
    updateOrder('step1', orderData.step1.filter(p => p.id !== id));
  };

  return (
    <div className="page-content resumen-page">
      <h2 className="resumen__title">🛒 Resumen de tu Pedido</h2>
      
      {orderData.step1.length === 0 ? (
        <div className="resumen__empty">
          <p className="resumen__emptyText">Tu carrito está vacío.</p>
          <Button onClick={() => navigate('/pedido')}>Ver el Menú</Button>
        </div>
      ) : (
        <div className="resumen-container resumen__container">
          <table className="resumen__table">
            <thead>
              <tr className="resumen__theadRow">
                <th className="resumen__th">Cantidad</th>
                <th className="resumen__th resumen__th--left">Platillo</th>
                <th className="resumen__th resumen__th--right">Unitario</th>
                <th className="resumen__th resumen__th--center">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {platosAgrupados.map((p) => (
                <tr key={p.id} className="resumen__row">
                  {/* Selector de Cantidad */}
                  <td className="resumen__td resumen__td--leftRound">
                    <div className="resumen__qtyPill">
                      <button 
                        onClick={() => restarPlato(p.id)}
                        className="resumen__qtyBtn"
                      >−</button>
                      <span className="resumen__qtyValue">{p.cantidadVista}</span>
                      <button 
                        onClick={() => sumarPlato(p)}
                        className="resumen__qtyBtn resumen__qtyBtn--plus"
                      >+</button>
                    </div>
                  </td>

                  <td className="resumen__td resumen__itemName">{p.nombre_platillo}</td>
                  <td className="resumen__td resumen__itemPrice">${Number(p.precio).toFixed(2)}</td>
                  
                  <td className="resumen__td resumen__td--rightRound">
                    <button 
                      onClick={() => eliminarTodo(p.id)} 
                      className="resumen__deleteBtn"
                    >
                      🗑️ Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr className="resumen__divider" />

          <div className="resumen__totalRow">
            <span className="resumen__totalLabel">Total a pagar:</span>
            <span className="resumen__totalValue">
              ${montoTotal.toFixed(2)}
            </span>
          </div>

          <div className="resumen__actions">
            <Button variant="secondary" onClick={() => navigate('/menu')}>
              ← Seguir Comprando
            </Button>
            <Button onClick={() => navigate('/menu/datos')}>
              Confirmar Datos →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}