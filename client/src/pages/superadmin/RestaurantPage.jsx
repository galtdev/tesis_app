import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { camposRestaurant } from '../../config/formConfig.js';
import { restaurantColumns } from '../../config/tableConfig.js';
import DynamicForm from '../../components/Form.jsx';
import DataTable from '../../components/Table.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import Notification from '../../components/Notification.jsx';
import '../../styles/admin.css';

export default function RestaurantPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [notification, setNotification] = useState({ text: '', type: '', target: '' });

  const handleClearMessage = () => {
    setNotification({ text: '', type: '', target: '' });
  };

  const consultRestaurants = async () => {
    const { data, error } = await api.get('/api/restaurant');
    if (!error) setRestaurants(data.body ?? []);
  };

  const registrarRestaurant = async (dataForm) => {
    const resp = await api.post('/api/restaurant', dataForm);

    if (!resp.error) {
      const correo = resp.data.body?.duenoCorreo || dataForm.correo;
      setNotification({
        text: `Restaurante registrado. El dueño inicia sesión en /admin/login con: ${correo}`,
        type: 'success',
        target: 'form',
      });
      consultRestaurants();
      setOpenModal(false);
    } else {
      setNotification({
        text: resp.error,
        type: 'error',
        target: 'form'
      });
    }
  };

  const eliminarRestaurant = async (id) => {
    const resp = await api.delete(`/api/restaurant/${id}`);

    if (!resp.error) {
      setNotification({
        text: 'Restaurante eliminado',
        type: 'advertencia',
        target: 'page'
      });
      consultRestaurants();
    }
  };

  useEffect(() => {
    consultRestaurants();
  }, []);

  return (
    <div className="page-content page-content--admin">
      <h1>Gestión de restaurantes</h1>
      <p className="admin-menu__productosTitle">
        Alta de comercios en la plataforma (vista Super Admin).
      </p>

      <Button variant="primary" onClick={() => setOpenModal(true)}>
        + Nuevo restaurante
      </Button>

      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title="Registrar restaurante"
      >
        <DynamicForm
          title="Datos del comercio"
          subtitle="Completa el formulario para dar de alta un restaurante"
          fields={camposRestaurant}
          onSubmit={registrarRestaurant}
          message={notification}
          clearMessage={handleClearMessage}
        />
      </Modal>

      <div className="admin-menu__notifWrap">
        <Notification
          text={notification.text}
          type={notification.type}
          onClose={handleClearMessage}
          target="page"
        />
      </div>

      <div className="table-container usuarios__section">
        <h2>Restaurantes en la plataforma</h2>
        <DataTable
          columns={restaurantColumns}
          data={restaurants}
          onDelete={eliminarRestaurant}
          edit={() => {}}
        />
      </div>
    </div>
  );
}
