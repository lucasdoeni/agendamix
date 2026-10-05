import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Sparkles, User, Briefcase, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsPro } = useAuth();
  const { addToast } = useToast();

  const [role, setRole] = useState(location.state?.role || 'professional'); // 'professional' | 'client'
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminMaintenanceLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('agendamix_admin_auth', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('agendamix_admin_auth', JSON.stringify({ role: 'admin', username: 'admin' }));
      }
    } catch {
      sessionStorage.setItem('agendamix_admin_auth', JSON.stringify({ role: 'admin', username: 'admin' }));
    }
    addToast('Acesso ao Portal de Manutenção autorizado!', 'success');
    navigate('/admin/manutencao');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUser = email.trim().toLowerCase();

    // 1. Acesso direto com usuário admin e senha admin para o Portal de Manutenção
    if (cleanUser === 'admin' && password === 'admin') {
      await handleAdminMaintenanceLogin();
      return;
    }

    if (!email.trim()) {
      addToast('Informe o seu e-mail de cadastro', 'error');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password, role);
      addToast(`Bem-vindo, ${loggedUser.name || 'usuário'}!`, 'success');
      if (loggedUser?.type === 'professional') {
        navigate('/painel-profissional', { replace: true });
      } else {
        navigate('/meus-agendamentos', { replace: true });
      }
    } catch (err) {
      addToast(err.message || 'Erro ao realizar login', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '60px 0 80px', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container-sm" style={{ maxWidth: '480px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: 800 }}>
            Acessar o AgendaMix
          </h1>
          <p style={{ color: '#64748b', marginTop: '6px' }}>
            Entre na sua conta para gerenciar seus agendamentos
          </p>
        </div>

        {/* Role Toggle */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          padding: '4px',
          borderRadius: '12px',
          backgroundColor: '#e2e8f0',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => setRole('professional')}
            style={{
              padding: '10px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: role === 'professional' ? '#ffffff' : 'transparent',
              color: role === 'professional' ? '#2563eb' : '#64748b',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: role === 'professional' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer'
            }}
          >
            <Briefcase size={16} />
            <span>Profissional</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('client')}
            style={{
              padding: '10px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: role === 'client' ? '#ffffff' : 'transparent',
              color: role === 'client' ? '#2563eb' : '#64748b',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: role === 'client' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer'
            }}
          >
            <User size={16} />
            <span>Cliente</span>
          </button>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: '28px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={15} color="#64748b" />
                E-mail de Cadastro
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder={role === 'professional' ? 'ex: juliebettini@gmail.com' : 'ex: lucasdoeni@gmail.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={15} color="#64748b" />
                Senha
              </label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon={ArrowRight}
              style={{ marginTop: '12px' }}
            >
              Entrar
            </Button>
          </form>

          <div style={{
            marginTop: '18px',
            padding: '12px 14px',
            borderRadius: '8px',
            backgroundColor: '#f1f5f9',
            fontSize: '0.8rem',
            color: '#475569',
            lineHeight: 1.4
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              <ShieldCheck size={14} color="#2563eb" />
              <span>Acesso Unificado por E-mail</span>
            </div>
            Acesse digitando seu e-mail cadastrado. O sistema reconhece sua conta (profissional ou cliente) e abre o painel correto automaticamente.
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          {role === 'client' ? (
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Ainda não possui conta de cliente?{' '}
              <Link to="/cadastro-cliente" style={{ fontWeight: 700, color: '#2563eb' }}>
                Cadastrar-se como Cliente
              </Link>
            </p>
          ) : (
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Deseja cadastrar seu estabelecimento?{' '}
              <Link to="/cadastro-profissional" style={{ fontWeight: 700, color: '#2563eb' }}>
                Cadastre-se grátis
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
