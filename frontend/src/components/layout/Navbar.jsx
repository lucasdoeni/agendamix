import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, User, Menu, X, Sparkles, LogOut, ChevronDown, Briefcase, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const { currentUser, isPro, logout, loginAsPro } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)'
          }}>
            <Calendar size={22} />
          </div>
          <div>
            <span style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              fontFamily: 'var(--font-family-display)',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}>
              AgendaMix
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: '24px'
        }} className="desktop-nav">
          <Link
            to="/"
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: isActive('/') ? '#2563eb' : '#475569',
              transition: 'color 0.2s'
            }}
          >
            Início
          </Link>
          <Link
            to="/profissionais"
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: isActive('/profissionais') ? '#2563eb' : '#475569',
              transition: 'color 0.2s'
            }}
          >
            Explorar
          </Link>
          <Link
            to="/meus-agendamentos"
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: isActive('/meus-agendamentos') ? '#2563eb' : '#475569',
              transition: 'color 0.2s'
            }}
          >
            Meus Agendamentos
          </Link>
        </nav>

        {/* Right CTA */}
        <div style={{ display: 'none', alignItems: 'center', gap: '12px' }} className="desktop-actions">
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    {currentUser.name?.[0]}
                  </div>
                )}
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                  {currentUser.commercialName || currentUser.name}
                </span>
                <ChevronDown size={14} color="#64748b" />
              </button>

              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  width: '220px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid #e2e8f0',
                  padding: '6px',
                  zIndex: 110,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  {isPro && (
                    <Link
                      to="/painel-profissional"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Briefcase size={16} color="#2563eb" />
                      Painel do Profissional
                    </Link>
                  )}
                  <Link
                    to="/meus-agendamentos"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Calendar size={16} color="#7c3aed" />
                    Minhas Reservas
                  </Link>
                  <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={16} color="#ef4444" />
                    Sair da Conta
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/cadastro-cliente">
                <Button variant="outline" size="sm">Cadastre-se</Button>
              </Link>
              <Link to="/login">
                <Button variant="primary" size="sm">Entrar</Button>
              </Link>
            </div>
          )}

          {isPro && (
            <Link to="/painel-profissional">
              <Button variant="primary" size="sm" icon={Briefcase}>
                Painel Pro
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Header Actions (Visível apenas em smartphones/telas < 768px) */}
        <div className="mobile-actions" style={{ display: 'none', alignItems: 'center', gap: '8px' }}>
          <Link to="/login">
            <Button variant="primary" size="sm" icon={LogIn} style={{ padding: '6px 12px', fontSize: '0.825rem' }}>
              Entrar
            </Button>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '7px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#1e293b',
              cursor: 'pointer'
            }}
            aria-label="Abrir Menu de Navegação"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }} className="animate-fade-in">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, color: '#1e293b', padding: '8px 0' }}
          >
            Início
          </Link>
          <Link
            to="/profissionais"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, color: '#1e293b', padding: '8px 0' }}
          >
            Explorar Profissionais
          </Link>
          <Link
            to="/meus-agendamentos"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, color: '#1e293b', padding: '8px 0' }}
          >
            Meus Agendamentos
          </Link>
          
          <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />

          {currentUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Conectado como:</span>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{currentUser.name}</strong>
              </div>

              {isPro && (
                <Link
                  to="/painel-profissional"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button fullWidth variant="primary" icon={Briefcase}>
                    Acessar Painel do Profissional
                  </Button>
                </Link>
              )}

              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button fullWidth variant="outline" icon={LogIn}>
                  Trocar de Conta / Entrar
                </Button>
              </Link>

              <Button
                fullWidth
                variant="outline"
                style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                icon={LogOut}
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
              >
                Sair da Conta
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button fullWidth variant="primary" icon={LogIn}>
                  Entrar no AgendaMix
                </Button>
              </Link>
              <Link to="/cadastro-cliente" onClick={() => setMobileMenuOpen(false)}>
                <Button fullWidth variant="outline">
                  Cadastrar-se como Cliente
                </Button>
              </Link>
              <Link to="/cadastro-profissional" onClick={() => setMobileMenuOpen(false)}>
                <Button fullWidth variant="ghost">
                  Cadastrar como Profissional
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Inlined media query helper */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-actions { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .desktop-actions { display: none !important; }
          .mobile-actions { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
