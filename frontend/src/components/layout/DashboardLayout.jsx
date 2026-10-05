import React, { useState, useRef } from 'react';
import { NavLink, Link, useNavigate, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Scissors, 
  Clock, 
  CalendarCheck, 
  ExternalLink, 
  LogOut, 
  Users, 
  ChevronRight, 
  Menu, 
  X,
  Sparkles,
  Camera,
  Upload
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { uploadImageToBackend } from '../../services/uploadService';
import { useToast } from '../../context/ToastContext';

export default function DashboardLayout({ children }) {
  const { currentUser, currentProData, isPro, logout, updateProAvatar } = useAuth();
  const { addToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  if (!isPro) {
    return <Navigate to="/login" replace />;
  }

  const pro = currentProData || currentUser || {};

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const serverUrl = await uploadImageToBackend(file);
        await updateProAvatar(serverUrl);
        addToast('Foto de perfil armazenada com sucesso no backend!', 'success');
      } catch (err) {
        addToast(err.message || 'Erro ao enviar foto para o servidor', 'error');
      }
    }
  };

  const navItems = [
    { to: '/painel-profissional', label: 'Visão Geral & Hoje', icon: LayoutDashboard, end: true },
    { to: '/painel-profissional/servicos', label: 'Catálogo de Serviços', icon: Scissors },
    { to: '/painel-profissional/horarios', label: 'Horários & Bloqueios', icon: Clock },
    { to: '/painel-profissional/historico', label: 'Histórico de Reservas', icon: CalendarCheck },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 72px)', background: '#f8fafc' }}>
      {/* Sidebar Desktop */}
      <aside
        style={{
          width: '280px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 16px',
          position: 'sticky',
          top: '72px',
          height: 'calc(100vh - 72px)',
          overflowY: 'auto'
        }}
        className="dashboard-sidebar-desktop"
      >
        <div>
          {/* Pro Card */}
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
            borderRadius: '14px',
            border: '1px solid #dbeafe',
            marginBottom: '24px'
          }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={currentProData.avatar}
                  alt={currentProData.name}
                  style={{ width: '52px', height: '52px', borderRadius: '14px', objectFit: 'cover', border: '2px solid #ffffff' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Alterar Foto de Perfil"
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: '2px solid #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                >
                  <Camera size={13} />
                </button>
              </div>

              <div style={{ overflow: 'hidden', flex: 1 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {currentProData.commercialName}
                </h4>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    fontSize: '0.75rem',
                    color: '#2563eb',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  Alterar Minha Foto
                </button>
              </div>
            </div>

            {/* Link para página pública */}
            <Link
              to={`/p/${currentProData.id}`}
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '12px',
                fontSize: '0.775rem',
                fontWeight: 600,
                color: '#2563eb'
              }}
            >
              <span>Ver meu Perfil Público</span>
              <ExternalLink size={13} />
            </Link>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '0 12px 8px' }}>
              Menu do Estabelecimento
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: isActive ? '#2563eb' : '#475569',
                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
                    transition: 'all 0.15s ease'
                  })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom Logout */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              width: '100%',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={16} />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px 24px', maxWidth: '100%', overflowX: 'hidden' }}>
        {/* Mobile Pro Selector Bar */}
        <div className="mobile-pro-bar" style={{
          display: 'none',
          marginBottom: '20px',
          background: '#ffffff',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={currentProData.avatar} style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{currentProData.commercialName}</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#eff6ff',
              color: '#2563eb',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Menu size={16} />
            <span>Menu Pro</span>
          </button>
        </div>

        {/* Mobile Drawer */}
        {sidebarOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 200,
            display: 'flex'
          }}>
            <div style={{
              width: '280px',
              background: '#ffffff',
              height: '100%',
              padding: '24px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontWeight: 700 }}>Menu do Profissional</span>
                  <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {navItems.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setSidebarOpen(false)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        color: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setSidebarOpen(false);
                  navigate('/');
                }}
                style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <LogOut size={16} /> Sair
              </button>
            </div>
          </div>
        )}

        {children}
      </main>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-sidebar-desktop { display: none !important; }
          .mobile-pro-bar { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
