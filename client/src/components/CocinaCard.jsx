import Button from './Button.jsx';
import '../styles/admin.css';

const CocinaCard = ({ pedido, onCompletar }) => {
  return (
    <div className="cocina-card">
      <div className="cocina-card__top">
        <span className="cocina-card__orden">ORDEN #{pedido.id}</span>
        <span
          className={`cocina-card__badge ${
            pedido.tipo_pedido === 'Para llevar'
              ? 'cocina-card__badge--llevar'
              : 'cocina-card__badge--local'
          }`}
        >
          {pedido.tipo_pedido}
        </span>
      </div>

      <div className="cocina-card__mid">
        <h3 className="cocina-card__mesa">📍 {pedido.mesa}</h3>
      </div>

      <div className="cocina-card__body">
        <ul className="cocina-card__list">
          {pedido.items.map((item) => (
            <li key={item.id} className="cocina-card__item">
              <span className="cocina-card__itemName">• {item.nombre_platillo}</span>
              <span className="cocina-card__itemStatus">PENDIENTE</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="cocina-card__footer">
        <Button 
          text="✅ Marcar Pedido como Listo" 
          color="success" 
          onClick={() => onCompletar(pedido.id)}
          className="btn-full"
        />
      </div>
    </div>
  );
};

export default CocinaCard;