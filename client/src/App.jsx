
import {Routes, Route} from 'react-router-dom';

// ------ ADMINS

import AdminLayout from './layouts/AdminLayout';
import PageUser from './pages/admin/UsuariosPage';
import MenuPage from './pages/admin/MenuPage';
import Dashboard from './pages/admin/DashboardPage';
import EstadisticasPage from './pages/admin/EstadisticasPage';
import CajaPage from './pages/admin/CajaPage';
import CocinaPage from './pages/admin/CocinaPage';

// ------ MENU CLIENT

import MenuClientLayout from './layouts/ClientMenuLayout';
import MenuClient from './pages/menu/MenuClientPage';
import ResumenPedido from './pages/menu/ResumenPage';
import PedidoData from './pages/menu/DataPedidoPage';
import PedidoPago from './pages/menu/DataPagoPage';  



function App() {

  return (
  
    <Routes>

      {/* Seccion admin */}

      <Route path="/admin" element={<AdminLayout/>}>
        <Route path="usuarios" element={<PageUser/>} />
        <Route path="menu" element={<MenuPage/>} />
        <Route path='dashboard' element={<Dashboard/>}></Route>
        <Route path="estadisticas" element={<EstadisticasPage />} />
        <Route path='caja' element={<CajaPage/>}></Route>
        <Route path='cocina' element={<CocinaPage/>}></Route>
      </Route>


      {/* Seccion menu cliente */}

      <Route path="/menu" element={<MenuClientLayout/>}>
        <Route path="" element={<MenuClient/>} />
        <Route path="resumen" element={<ResumenPedido/>} />
        <Route path="datos" element={<PedidoData/>} />
        <Route path="pago" element={<PedidoPago/>}/>
        
      </Route>

    </Routes>
    
  )
}

export default App
