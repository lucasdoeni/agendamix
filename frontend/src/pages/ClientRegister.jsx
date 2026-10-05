import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import { storageService } from '../services/storageService';
import { API_URL } from '../services/apiConfig';

export default function ClientRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentUser } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: location.state?.name || '',
    email: location.state?.email || '',
    phone: location.state?.phone || '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      addToast('Preencha os campos obrigatórios (Nome, E-mail e Senha)', 'error');
      return;
    }

    if (formData.password.length < 3) {
      addToast('A senha deve ter pelo menos 3 caracteres', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast('As senhas não coincidem', 'error');
      return;
    }

    setLoading(true);

    if (API_URL) {
      try {
        const res = await fetch(`${API_URL}/auth/register-client`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password
          })
        });

        const data = await res.json();

        if (res.ok) {
          addToast('Cadastro realizado com sucesso!', 'success');
          setCurrentUser(data.user);
          navigate('/meus-agendamentos');
          return;
        } else {
          addToast(data.error || 'Erro ao realizar cadastro de cliente', 'error');
          setLoading(false);
          return;
        }
      } catch (err) {}
    }

    // Fallback local seguro (GitHub Pages / offline)
    try {
      const clients = storageService.getClients();
      const cleanEmail = formData.email.trim().toLowerCase();
      const existing = clients.find(c => (c.email || '').trim().toLowerCase() === cleanEmail);
      if (existing) {
        addToast('Este e-mail já está cadastrado como cliente.', 'error');
        setLoading(false);
        return;
      }

      const newClient = {
        id: 'cli-' + Date.now(),
        name: formData.name.trim(),
        email: cleanEmail,
        phone: formData.phone.trim(),
        password: formData.password
      };
      clients.unshift(newClient);
      localStorage.setItem('agendamix_clients_v3', JSON.stringify(clients));

      const loggedUser = {
        type: 'client',
        clientId: newClient.id,
        id: newClient.id,
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone
      };
      setCurrentUser(loggedUser);
      addToast('Cadastro realizado com sucesso!', 'success');
      navigate('/meus-agendamentos');
    } catch (err) {
      addToast('Erro ao concluir cadastro: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '40px 0 60px', minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <div className="container-sm" style={{ maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            margin: '0 auto 14px',
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)'
          }}>
            <User size={26} />
          </div>
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>
            Criar Conta de Cliente
          </h1>
          <p style={{ color: '#64748b', marginTop: '6px' }}>
            Agende serviços nos melhores estabelecimentos com rapidez
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nome Completo *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="name"
                  required
                  className="form-input"
                  placeholder="Ex: Carlos Eduardo Silva"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">E-mail *</label>
              <input
                type="email"
                name="email"
                required
                className="form-input"
                placeholder="seu.email@exemplo.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Telefone / WhatsApp</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="(11) 98765-4321"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Senha *</label>
              <input
                type="password"
                name="password"
                required
                className="form-input"
                placeholder="Crie uma senha segura"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirmar Senha *</label>
              <input
                type="password"
                name="confirmPassword"
                required
                className="form-input"
                placeholder="Repita sua senha"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon={ArrowRight}
              style={{ marginTop: '8px' }}
            >
              Criar Conta e Acessar
            </Button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Já tem uma conta de cliente?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: '#2563eb' }}>
              Fazer Login
            </Link>
          </p>

          <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: 0 }}>
            É um profissional da beleza ou estética?{' '}
            <Link to="/cadastro-profissional" style={{ fontWeight: 600, color: '#7c3aed' }}>
              Cadastre seu estabelecimento
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
