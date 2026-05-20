import { menuColums} from '../../config/tableConfig.js';
import {api} from '../../services/api.js';
// Limpiamos la importación duplicada aquí:
import { camposMenu, camposEditMenu } from '../../config/formConfig.js';
import { useState, useEffect } from 'react';

import Modal from '../../components/Modal.jsx';
import DataTable from '../../components/Table.jsx';
import DynamicForm from '../../components/Form.jsx';
import Notification from '../../components/Notification.jsx';
import ProductCard from '../../components/MenuCard.jsx';
import Button from '../../components/Button.jsx'; 
import '../../styles/styles.css';
import '../../styles/admin.css';

export default function MenuPage() {

  const [platos, setPlatos] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [notification, setNotification] = useState({ text: '', type: '', target: '' });
  const [editPlato, setEditPlato] = useState(null);

  const handleClearMessage = () => {
    setNotification({ text: '', type: '', target: '' });
  }

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditPlato(null);

  }



  const consultPlatos = async () => {
    const {data, error} = await api.get('/api/menu');
    if (!error) setPlatos(data.body);
  }



  const registrarPlato = async (dataForm) => {
    const formData = new FormData();
    if (editPlato && editPlato.id) formData.append('id', editPlato.id);

    Object.keys(dataForm).forEach(key => {
      if (key !== 'id') formData.append(key, dataForm[key]);
    });
    
    const resp = await api.post('/api/menu', formData);

    if (!resp.error) {
      const mensaje = editPlato ? 'Plato actualizado correctamente' : 'Plato registrado';
      setNotification({ text: mensaje, type: 'success', target: 'form' });
      consultPlatos();
    }
  };

  const eliminarPlato = async (id)=>{
    const resp = await api.delete(`/api/menu/${id}`);
    if(!resp.error) {
      setNotification({ text: `${resp.data.body}`, type: 'advertencia', target:'page' })
      consultPlatos();
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      consultPlatos();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="page-content page-content--admin">
      <h1>Gestión de Menú</h1>
      <Button variant='primary' onClick={() => setOpenModal(true)}>
        + Agregar Platillo
      </Button>

      <Modal
        isOpen={openModal}
        onClose={handleCloseModal}
        title={editPlato ? "Editar platillo" : "Agregar platillo"}
      >
        <DynamicForm
          initialData={editPlato}
          subtitle={editPlato ? "Modifica datos del plato" : "Registra un nuevo platillo en el menú"}
          fields={editPlato ? camposEditMenu : camposMenu} 
          onSubmit={registrarPlato} 
          message={notification}
          clearMessage={handleClearMessage}
        />
      </Modal>
    
      <div className="table-container">
        <DataTable columns={menuColums} data={platos} onDelete={eliminarPlato} edit={(item) => {
          setEditPlato(item);
          setOpenModal(true);
        }}/>
      </div>

      <div className="admin-menu__notifWrap">
        <Notification 
          text={notification.text}   
          type={notification.type}   
          onClose={handleClearMessage} 
          target='page'
        />
      </div>

      <h2 className="admin-menu__productosTitle">Vista de Productos</h2>
      
      <div className="admin-menu__productosGrid">
        {platos.map((data) => (
          <ProductCard
            key={data.id} 
            name={data.nombre_platillo} 
            price={data.precio} 
            contain={data.contenido}
            category={data.category}
            image={data.imagen ? `/imagenes/${data.imagen}` : "https://via.placeholder.com/200"}
            onAdd={() => alert(`Agregado: ${data.nombre_platillo}`)}
          />
        ))}
      </div>
    </div>
  );
}