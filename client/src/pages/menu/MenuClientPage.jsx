import {api} from '../../services/api.js'
import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/MenuCard.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import '../../styles/styles.css';
import '../../styles/client.css';



export default function MenuClient() {

  const [platillos, setPlatillos] = useState([]);
  const {orderData, updateOrder} = useOutletContext();

  const navigate = useNavigate();


  const consult = async () => {
    const {data, error} = await api.get('/api/menu');
    
    if (!error) setPlatillos(data.body);
  
  }


  const agregarPlatillo = (item) => {
   
    const existe = orderData.step1.some(p => Number(p.id) === Number(item.id));
    
    if (existe) {
      const nuevaLista = orderData.step1.filter(p => Number(p.id) !== Number(item.id));
      updateOrder('step1', nuevaLista);
      console.log("Platillo quitado:", item.nombre_platillo);
    } else {
  
      const nuevoPlatillo = {
        id: item.id,
        nombre_platillo: item.nombre_platillo,
        precio: item.precio
      };
      updateOrder('step1', [...orderData.step1, nuevoPlatillo]);
      console.log("Platillo agregado:", item.nombre_platillo);
      console.log(orderData)
    }
  };


  useEffect(()=>{
    const t = setTimeout(() => {
      consult();
    }, 0);
    return () => clearTimeout(t);
  }, []);



  return (

    

    <div className="page-content page-content--client">
      <div className="client-menu__header">
        <h1>Menu Cliente</h1>
         <Button onClick={() => navigate('/admin/dashboard')}>
            Ir a admin dashboard
          </Button>
        {/* Solo mostramos el botón si hay algo en el carrito */}
        {orderData.step1.length > 0 && (
          <Button onClick={() => navigate('/menu/resumen')}>
            Continuar al Resumen ({orderData.step1.length})
          </Button>
        )}
      </div>

      <div className="client-menu__grid">
        {platillos.map((data) => {
          const estaAgregado = orderData.step1.some(p => p.id === data.id);
          return (
            <ProductCard
              key={data.id} 
              category={data.category}
              name={data.nombre_platillo} 
              price={data.precio}
              contain={data.contenido}
              image={data.imagen ? `/imagenes/${data.imagen}` : "https://via.placeholder.com/200"}
              text={estaAgregado ? '✅ Seleccionado' : 'Agregar Pedido'}
              onAdd={() => agregarPlatillo(data)} 
            />
          );
        })}
      </div>
    </div>
  );
}