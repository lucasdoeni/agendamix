import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  XCircle, 
  CheckCircle2, 
  ArrowRight, 
  User, 
  Pencil, 
  Lock, 
  Phone, 
  Mail, 
  Sparkles,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { API_URL } from '../services/apiConfig';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

export default function ClientPanel() {
  const { currentUser, isClient, setCurrentUser, logout } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'profile'
  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [, setTick] = useState(0);

  // Estado para Edição dos Dados do Cliente
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Inicializa dados do cliente conectado
  useEffect(() => {
    if (isClient && currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        password: '',
        confirmPassword: ''
      });

      // Busca reservas do cliente conectado automaticamente
      const clientBookings = storageService.getBookingsByClient(currentUser.email);
      setResults(clientBookings);
      setSearched(true);
    }
  }, [isClient, currentUser]);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      addToast('Digite seu telefone ou e-mail para localizar seus agendamentos', 'info');
      return;
    }
    const found = storageService.getBookingsByClient(searchQuery);
    setResults(found);
    setSearched(true);
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      try {
        storageService.updateBookingStatus(bookingId, 'cancelled');
        addToast('Agendamento cancelado com sucesso.', 'info');
        setResults(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
        setTick(t => t + 1);
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  // Salvar alteração dos dados do cliente
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      addToast('Nome e E-mail são obrigatórios', 'error');
      return;
    }

    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      addToast('A confirmação de senha não confere', 'error');
      return;
    }

    setSavingProfile(true);

    if (API_URL) {
      try {
        const res = await fetch(`${API_URL}/auth/client-profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentUser?.id,
            currentEmail: currentUser?.email,
            name: profileForm.name,
            email: profileForm.email,
            phone: profileForm.phone,
            password: profileForm.password
          })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          addToast('Seus dados foram atualizados com sucesso!', 'success');
          setCurrentUser(data.user);
          setProfileForm(prev => ({
            ...prev,
            password: '',
            confirmPassword: ''
          }));
          setSavingProfile(false);
          return;
        } else {
          addToast(data.error || 'Erro ao atualizar dados', 'error');
          setSavingProfile(false);
          return;
        }
      } catch (err) {}
    }

    // Fallback local seguro (GitHub Pages / offline)
    try {
      const updatedUser = {
        ...currentUser,
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone
      };
      setCurrentUser(updatedUser);

      const clients = storageService.getClients();
      const idx = clients.findIndex(c => c.id === currentUser?.id || c.email === currentUser?.email);
      if (idx !== -1) {
        clients[idx] = {
          ...clients[idx],
          name: profileForm.name,
          email: profileForm.email,
          phone: profileForm.phone,
          ...(profileForm.password ? { password: profileForm.password } : {})
        };
        localStorage.setItem('agendamix_clients_v3', JSON.stringify(clients));
      }

      addToast('Seus dados foram atualizados com sucesso!', 'success');
      setProfileForm(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } catch (err) {
      addToast('Erro ao atualizar perfil: ' + err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Divide between upcoming and past/cancelled
  const activeBookings = results.filter(b => b.status === 'confirmed');
  const pastBookings = results.filter(b => b.status !== 'confirmed');

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '48px 0 80px', minHeight: '80vh' }}>
      <div className="container-sm" style={{ maxWidth: '820px' }}>
        
        {/* Header Superior */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            background: 'var(--color-primary-50)',
            color: '#2563eb',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            <Calendar size={16} />
            <span>Área do Cliente</span>
          </div>

          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>
            {isClient && currentUser ? `Olá, ${currentUser.name}` : 'Painel do Cliente'}
          </h1>
          <p style={{ color: '#64748b', marginTop: '6px' }}>
            {isClient && currentUser
              ? 'Gerencie seus agendamentos e atualize seus dados cadastrais'
              : 'Consulte seus horários marcados ou acesse sua conta'}
          </p>
        </div>

        {/* Banner para Clientes não conectados */}
        {!isClient && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <User size={22} color="#2563eb" />
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#1e3a8a', display: 'block' }}>
                  Já possui uma conta de cliente?
                </strong>
                <span style={{ fontSize: '0.85rem', color: '#3b82f6' }}>
                  Faça login para editar seus dados e ver suas reservas em um clique.
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/cadastro-cliente">
                <Button variant="outline" size="sm">Cadastrar</Button>
              </Link>
              <Link to="/login">
                <Button variant="primary" size="sm">Entrar</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Abas de Navegação (Disponíveis quando logado como cliente) */}
        {isClient && (
          <div style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '2px solid #e2e8f0',
            marginBottom: '28px',
            overflowX: 'auto',
            paddingBottom: '2px'
          }}>
            <button
              onClick={() => setActiveTab('bookings')}
              style={{
                padding: '12px 20px',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: activeTab === 'bookings' ? '#2563eb' : '#64748b',
                borderBottom: activeTab === 'bookings' ? '3px solid #2563eb' : '3px solid transparent',
                marginBottom: '-2px',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Calendar size={18} />
              <span>Minhas Reservas ({results.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '12px 20px',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: activeTab === 'profile' ? '#2563eb' : '#64748b',
                borderBottom: activeTab === 'profile' ? '3px solid #2563eb' : '3px solid transparent',
                marginBottom: '-2px',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Pencil size={18} />
              <span>Editar Meus Dados</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 1: MINHAS RESERVAS */}
        {/* ======================================================== */}
        {(!isClient || activeTab === 'bookings') && (
          <div>
            {/* Widget de Busca Manual (para clientes não logados ou busca adicional) */}
            {!isClient && (
              <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    flex: 1,
                    minWidth: '240px'
                  }}>
                    <Search size={18} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Informe seu Telefone WhatsApp ou E-mail utilizado na reserva..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        width: '100%',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>
                  <Button type="submit" variant="primary" size="md">
                    Localizar Reservas
                  </Button>
                </form>
              </div>
            )}

            {/* Lista de Reservas */}
            {searched && (
              <div>
                {results.length === 0 ? (
                  <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                    <Calendar size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>Nenhum agendamento encontrado</h3>
                    <p style={{ color: '#64748b', marginTop: '6px', marginBottom: '20px' }}>
                      Não encontramos reservas cadastradas para sua conta no momento.
                    </p>
                    <Link to="/profissionais">
                      <Button variant="primary">Explorar Profissionais & Agendar</Button>
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Agendamentos Ativos */}
                    <div>
                      <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '16px' }}>
                        Agendamentos Ativos ({activeBookings.length})
                      </h3>

                      {activeBookings.length === 0 ? (
                        <div className="card" style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                          Você não possui nenhum agendamento pendente no momento.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {activeBookings.map(b => (
                            <div key={b.id} className="card" style={{ padding: '20px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
                                <div>
                                  <Badge variant="success">Confirmado</Badge>
                                  <h4 style={{ fontSize: '1.15rem', color: '#0f172a', marginTop: '6px' }}>
                                    {b.commercialName}
                                  </h4>
                                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                                    Responsável: {b.proName}
                                  </p>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Código: #{b.id.slice(-6)}</span>
                                  <strong style={{ display: 'block', fontSize: '1.15rem', color: '#10b981' }}>
                                    R$ {Number(b.price).toFixed(2).replace('.', ',')}
                                  </strong>
                                </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.875rem', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                                  <Calendar size={16} color="#2563eb" />
                                  <span>Data: <strong>{b.date}</strong> às <strong>{b.time}</strong></span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                                  <Clock size={16} color="#7c3aed" />
                                  <span>Serviço: <strong>{b.serviceName}</strong> ({b.duration}m)</span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <Link to={`/p/${b.proId}`}>
                                  <Button variant="outline" size="sm">Ver Perfil</Button>
                                </Link>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  icon={XCircle}
                                  onClick={() => handleCancelBooking(b.id)}
                                >
                                  Cancelar Reserva
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Histórico Anterior */}
                    {pastBookings.length > 0 && (
                      <div>
                        <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '16px' }}>
                          Histórico Anterior ({pastBookings.length})
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {pastBookings.map(b => (
                            <div key={b.id} className="card" style={{ padding: '16px', backgroundColor: '#f8fafc' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                  <strong style={{ fontSize: '0.95rem', color: '#334155' }}>{b.commercialName}</strong>
                                  <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>
                                    {b.serviceName} • {b.date} às {b.time}
                                  </span>
                                </div>

                                <div>
                                  {b.status === 'completed' && <Badge variant="primary">Concluído</Badge>}
                                  {b.status === 'cancelled' && <Badge variant="danger">Cancelado</Badge>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 2: EDITAR MEUS DADOS (PERFIL DO CLIENTE) */}
        {/* ======================================================== */}
        {isClient && activeTab === 'profile' && (
          <div className="card">
            <div style={{ marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 800 }}>
                Meus Dados Cadastrais
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '4px 0 0' }}>
                Mantenha suas informações pessoais e de contato atualizadas no sistema.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nome Completo *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">E-mail *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="(11) 98765-4321"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '8px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                  Alteração de Senha (Opcional)
                </span>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>
                  Deixe os campos abaixo em branco caso deseje manter sua senha atual.
                </p>

                <div className="form-grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nova Senha</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Nova senha segura"
                      value={profileForm.password}
                      onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Repita a nova senha"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={savingProfile}
                  icon={CheckCircle2}
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
