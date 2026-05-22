import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from '../components/SuperAdminSidebar';
import '../styles/styles.css';

export default function SuperAdminLayout() {
  return (
    <div className="admin-layout">
      <SuperAdminSidebar />

      <div className="main-container">
        <main className="main-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
