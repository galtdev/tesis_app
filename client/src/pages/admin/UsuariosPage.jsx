import DataTable from '../../components/Table.jsx';
import DynamicForm from '../../components/Form.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import Notification from '../../components/Notification.jsx';
import {api} from '../../services/api.js'
import {camposUsuario} from '../../config/formConfig.js'
import { usuariosColumns } from '../../config/tableConfig.js';
import { useState, useEffect} from 'react';
import '../../styles/admin.css';

export default function UsuariosPage() {

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [notification, setNotification] = useState({ text: '', type: '', target: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClearMessage = () => {
    setNotification({ text: '', type: '' });
  };


  const consultarHttp = async ()=> {
    const res = await api.get(`/api/user`);
    setCargando(false);
    setUsuarios(res.data.body);
  };

  
  const guardarUsuario = async (data) => {
    const res = await api.post(`/api/user`, data);
    if(!res.error){
      setNotification({text: 'Usuario Registrado', type: 'success', target: 'form'});
      consultarHttp();
    }
  };


  const eliminarUsuario = async (id) => {

  const {error} = await api.delete(`/api/user/${id}`);

  if (!error) {
    setNotification({ text: 'Usuario eliminado correctamente', type: 'advertencia', target: 'page' });
    consultarHttp();
  } 
};


  useEffect(() => {
    const t = setTimeout(() => {
      consultarHttp();
    }, 0);
    return () => clearTimeout(t);
  }, []);



  return (
    <div className="page-content">
      <Button variant='primary' onClick={()=> setIsModalOpen(true)}>
        + Nuevo Usuario
      </Button>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Gestión de Usuarios"
      >
        <DynamicForm 
          subtitle="Registra un nuevo usuario en la base de datos"
          fields={camposUsuario} 
          onSubmit={guardarUsuario} 
          message={notification}
          clearMessage={handleClearMessage}

        />
      </Modal>

      <div className="usuarios__section">
        <h2>Lista de Usuarios</h2>
        {cargando ? (
          <p>cargando datos...</p>
        ) : ( 
          <DataTable columns={usuariosColumns} data={usuarios} onDelete={eliminarUsuario}/>
        )}
      </div>
     {notification.text && (
        <div className="usuarios__notifWrap">
          <Notification 
            text={notification.text}   
            type={notification.type}   
            onClose={handleClearMessage} 
            target='page'
          />
        </div>
      )}
    </div>
  );
}