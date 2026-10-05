import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';

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

    try {
      const res = await fetch('http://localhost:5000/api/auth/register-client', {
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
        // Define o usuário logado no AuthContext
        setCurrentUser(data.user);
        navigate('/meus-agendamentos');
      } else {
        addToast(data.error || 'Erro ao realizar cadastro de cliente', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Erro ao conectar ao servidor MySQL', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '60px 0 80px', minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <div className="container-sm" style={{ maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            margin: '0 auto 16px',
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)'
          }}>
            <User size={28} />
          </div>
          <h1 style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: 800 }}>
            Criar Conta de Cliente
          </h1>
          <p style={{ color: '#64748b', marginTop: '6px' }}>
            Agende serviços nos melhores estabelecimentos com rapidez
          </p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
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
