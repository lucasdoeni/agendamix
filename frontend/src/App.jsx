import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import ProProfile from './pages/ProProfile';
import ProRegister from './pages/ProRegister';
import ClientRegister from './pages/ClientRegister';
import Login from './pages/Login';
import ClientPanel from './pages/ClientPanel';
import NotFound from './pages/NotFound';
import AdminMaintenance from './pages/AdminMaintenance';

// Dashboard Subpages
import DashboardHome from './pages/ProDashboard/DashboardHome';
import DashboardServices from './pages/ProDashboard/DashboardServices';
import DashboardSchedule from './pages/ProDashboard/DashboardSchedule';
import DashboardBookings from './pages/ProDashboard/DashboardBookings';

import { initStorage } from './services/storageService';

// Public Layout (Navbar + Content + Footer)
function PublicLayout() {
  return (
    <>
      <Navbar />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <Footer />
    </>
  );
}

// Pro Dashboard Wrapper (Navbar + DashboardLayout)
function ProDashboardWrapper() {
  return (
    <>
      <Navbar />
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </>
  );
}

export default function App() {
  useEffect(() => {
    initStorage();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Full Header & Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profissionais" element={<Explore />} />
          <Route path="/cadastro-profissional" element={<ProRegister />} />
          <Route path="/cadastro-cliente" element={<ClientRegister />} />
          <Route path="/login" element={<Login />} />
          <Route path="/meus-agendamentos" element={<ClientPanel />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Redirecionamento de rota legada */}
        <Route path="/sou-profissional" element={<Navigate to="/login" replace />} />

        {/* Menu de Manutenção Administrativo */}
        <Route path="/admin/manutencao" element={<><Navbar /><AdminMaintenance /><Footer /></>} />

        {/* Perfil Público do Profissional (sem Navbar superior global) */}
        <Route path="/p/:id" element={<><ProProfile /><Footer /></>} />

        {/* Professional Dashboard SaaS Routes */}
        <Route path="/painel-profissional" element={<ProDashboardWrapper />}>
          <Route index element={<DashboardHome />} />
          <Route path="servicos" element={<DashboardServices />} />
          <Route path="horarios" element={<DashboardSchedule />} />
          <Route path="historico" element={<DashboardBookings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
