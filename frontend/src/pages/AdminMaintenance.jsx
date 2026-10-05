import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Trash2, 
  Pencil, 
  Plus, 
  CreditCard, 
  Users, 
  Database, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Building, 
  DollarSign,
  Sparkles,
  RefreshCw,
  UserPlus,
  X,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  User,
  ExternalLink
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { storageService } from '../services/storageService';

const AVAILABLE_CATEGORIES = [
  { id: 'barbearia', label: 'Barbearia' },
  { id: 'cabeleireiro', label: 'Cabeleireiro' },
  { id: 'manicure', label: 'Manicure' },
  { id: 'estetica', label: 'Estética' },
  { id: 'sobrancelhas', label: 'Sobrancelhas' },
  { id: 'maquiagem', label: 'Maquiagem' },
  { id: 'spa', label: 'Spa & Massagem' }
];

const DEFAULT_PAYMENT_OPTIONS = [
  { id: 'Pix', label: 'Pix (Chave ou QR Code)', badge: '⚡ Pix' },
  { id: 'Cartão de Crédito', label: 'Cartão de Crédito (Visa, Master, Elo)', badge: '💳 Crédito' },
  { id: 'Cartão de Débito', label: 'Cartão de Débito', badge: '💳 Débito' },
  { id: 'Dinheiro', label: 'Dinheiro em Espécie', badge: '💵 Dinheiro' },
  { id: 'Boleto Bancário', label: 'Boleto Bancário', badge: '📄 Boleto' },
  { id: 'Link de Pagamento / PicPay', label: 'Link de Pagamento / PicPay', badge: '📱 Link / App' }
];

export default function AdminMaintenance() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'payments' | 'database'
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ professionals: [], clients: [] });
  const [searchQuery, setSearchQuery] = useState('');

  // Modais de Criação
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState('professional'); // 'professional' | 'client'
  const [savingCreate, setSavingCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    commercialName: '',
    categories: ['barbearia'],
    email: '',
    phone: '',
    password: '',
    street: '',
    number: '',
    neighborhood: '',
    complement: '',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    bio: '',
    paymentMethods: ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro']
  });

  // Modal de Edição de Profissional
  const [editProModalOpen, setEditProModalOpen] = useState(false);
  const [savingEditPro, setSavingEditPro] = useState(false);
  const [editProForm, setEditProForm] = useState({
    id: '',
    name: '',
    commercialName: '',
    categories: [],
    email: '',
    phone: '',
    password: '',
    street: '',
    number: '',
    neighborhood: '',
    complement: '',
    city: '',
    state: '',
    country: '',
    bio: '',
    paymentMethods: []
  });

  // Modal de Edição de Cliente
  const [editClientModalOpen, setEditClientModalOpen] = useState(false);
  const [savingEditClient, setSavingEditClient] = useState(false);
  const [editClientForm, setEditClientForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  // Estado para exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Estado para Formas de Pagamento
  const [selectedProId, setSelectedProId] = useState('');
  const [selectedMethods, setSelectedMethods] = useState([]);
  const [customMethod, setCustomMethod] = useState('');
  const [savingPayments, setSavingPayments] = useState(false);

  // Verifica autenticação admin
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('agendamix_admin_auth');
    if (!adminAuth) {
      navigate('/login');
      return;
    }
    fetchAdminData();
  }, [navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const result = await storageService.getAdminData();
      setData({
        professionals: result.professionals || [],
        clients: result.clients || []
      });

      if (result.professionals && result.professionals.length > 0 && !selectedProId) {
        setSelectedProId(result.professionals[0].id);
        setSelectedMethods(result.professionals[0].paymentMethods || []);
      }
    } catch (err) {
      console.warn('Erro ao carregar dados admin, recorrendo a dados locais:', err);
      const pros = storageService.getProfessionals();
      const clients = storageService.getClients();
      setData({
        professionals: pros || [],
        clients: clients || []
      });
    } finally {
      setLoading(false);
    }
  };

  // Abrir Modal de Criação
  const handleOpenCreate = (type = 'professional') => {
    setCreateType(type);
    setCreateForm({
      name: '',
      commercialName: '',
      categories: ['barbearia'],
      email: '',
      phone: '',
      password: '',
      street: '',
      number: '',
      neighborhood: '',
      complement: '',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      bio: '',
      paymentMethods: ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro']
    });
    setCreateModalOpen(true);
  };

  // Submeter Criação de Usuário (Profissional ou Cliente)
  const handleSaveCreate = async (e) => {
    e.preventDefault();

    if (!createForm.name.trim() || !createForm.email.trim()) {
      addToast('Preencha os campos obrigatórios (Nome e E-mail)', 'error');
      return;
    }

    if (createType === 'professional' && !createForm.commercialName.trim()) {
      addToast('Informe o Nome Comercial / Fantasia do profissional', 'error');
      return;
    }

    setSavingCreate(true);
    try {
      const res = await storageService.createAdminUser(createForm, createType);

      if (res.success) {
        addToast(res.message || 'Usuário criado com sucesso!', 'success');
        setCreateModalOpen(false);
        await fetchAdminData();
      } else {
        addToast(res.message || 'Erro ao criar usuário', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Erro ao processar criação de usuário', 'error');
    } finally {
      setSavingCreate(false);
    }
  };

  // Abrir Modal de Edição de Profissional
  const handleOpenEditPro = (pro) => {
    const rawCategories = Array.isArray(pro.categories) && pro.categories.length > 0
      ? pro.categories
      : (pro.category ? pro.category.split(',').map(c => c.trim()) : []);

    const rawPayments = Array.isArray(pro.paymentMethods)
      ? pro.paymentMethods
      : (typeof pro.paymentMethods === 'string' ? pro.paymentMethods.split(',').map(p => p.trim()) : []);

    setEditProForm({
      id: pro.id,
      name: pro.name || '',
      commercialName: pro.commercialName || '',
      categories: rawCategories,
      email: pro.email || '',
      phone: pro.phone || '',
      password: '', // em branco por padrão
      street: pro.street || '',
      number: pro.number || '',
      neighborhood: pro.neighborhood || '',
      complement: pro.complement || '',
      city: pro.city || 'São Paulo',
      state: pro.state || 'SP',
      country: pro.country || 'Brasil',
      bio: pro.bio || '',
      paymentMethods: rawPayments
    });
    setEditProModalOpen(true);
  };

  // Submeter Edição de Profissional
  const handleSaveEditPro = async (e) => {
    e.preventDefault();

    if (!editProForm.name.trim() || !editProForm.commercialName.trim() || !editProForm.email.trim()) {
      addToast('Nome, Nome Comercial e E-mail são obrigatórios', 'error');
      return;
    }

    setSavingEditPro(true);
    try {
      const res = await storageService.updateAdminPro(editProForm.id, editProForm);

      if (res.success) {
        addToast(res.message || 'Profissional atualizado com sucesso!', 'success');
        setEditProModalOpen(false);
        await fetchAdminData();
      } else {
        addToast(res.message || 'Erro ao atualizar profissional', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Erro ao atualizar profissional', 'error');
    } finally {
      setSavingEditPro(false);
    }
  };

  // Abrir Modal de Edição de Cliente
  const handleOpenEditClient = (client) => {
    setEditClientForm({
      id: client.id,
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      password: ''
    });
    setEditClientModalOpen(true);
  };

  // Submeter Edição de Cliente
  const handleSaveEditClient = async (e) => {
    e.preventDefault();

    if (!editClientForm.name.trim() || !editClientForm.email.trim()) {
      addToast('Nome e E-mail são obrigatórios', 'error');
      return;
    }

    setSavingEditClient(true);
    try {
      const res = await storageService.updateAdminClient(editClientForm.id || editClientForm.email, editClientForm);

      if (res.success) {
        addToast(res.message || 'Cliente atualizado com sucesso!', 'success');
        setEditClientModalOpen(false);
        await fetchAdminData();
      } else {
        addToast(res.message || 'Erro ao atualizar cliente', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Erro ao atualizar cliente', 'error');
    } finally {
      setSavingEditClient(false);
    }
  };

  // Exclusão
  const handleOpenDelete = (user, type = 'professional') => {
    setUserToDelete({ ...user, type });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      if (userToDelete.type === 'professional') {
        const res = await storageService.deleteAdminPro(userToDelete.id);

        if (res.success) {
          addToast(res.message || `Profissional "${userToDelete.commercialName}" excluído com sucesso!`, 'success');
          setData(prev => ({
            ...prev,
            professionals: prev.professionals.filter(p => p.id !== userToDelete.id)
          }));
        } else {
          addToast(res.message || 'Erro ao excluir profissional', 'error');
        }
      } else {
        const res = await storageService.deleteAdminClient(userToDelete.id, userToDelete.email, userToDelete.phone);

        if (res.success) {
          addToast(res.message || 'Histórico do cliente removido com sucesso!', 'success');
          setData(prev => ({
            ...prev,
            clients: prev.clients.filter(c => c.email !== userToDelete.email && c.id !== userToDelete.id)
          }));
        } else {
          addToast(res.message || 'Erro ao excluir cliente', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      addToast('Erro ao excluir usuário', 'error');
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  // Formas de Pagamento
  const handleProSelect = (proId) => {
    setSelectedProId(proId);
    const pro = data.professionals.find(p => p.id === proId);
    setSelectedMethods(pro?.paymentMethods || []);
  };

  const handleTogglePaymentMethod = (methodId) => {
    if (selectedMethods.includes(methodId)) {
      setSelectedMethods(selectedMethods.filter(m => m !== methodId));
    } else {
      setSelectedMethods([...selectedMethods, methodId]);
    }
  };

  const handleAddCustomMethod = (e) => {
    e.preventDefault();
    if (!customMethod.trim()) return;
    if (!selectedMethods.includes(customMethod.trim())) {
      setSelectedMethods([...selectedMethods, customMethod.trim()]);
    }
    setCustomMethod('');
  };

  const handleSavePaymentMethods = async () => {
    if (!selectedProId) return;
    setSavingPayments(true);

    try {
      const res = await storageService.updateAdminPaymentMethods(selectedProId, selectedMethods);

      if (res.success) {
        addToast(res.message || 'Formas de pagamento salvas com sucesso!', 'success');
        setData(prev => ({
          ...prev,
          professionals: prev.professionals.map(p => 
            p.id === selectedProId ? { ...p, paymentMethods: selectedMethods } : p
          )
        }));
      } else {
        addToast(res.message || 'Erro ao salvar formas de pagamento', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Erro ao salvar formas de pagamento', 'error');
    } finally {
      setSavingPayments(false);
    }
  };

  const handleForceSyncSeed = async () => {
    setLoading(true);
    try {
      const res = await storageService.syncFromMySQLSeed();
      addToast(`Dados sincronizados com sucesso! ${res.countPros} profissionais e ${res.countClients} clientes do MySQL carregados.`, 'success');
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      addToast('Erro ao sincronizar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAdmin = () => {
    sessionStorage.removeItem('agendamix_admin_auth');
    addToast('Sessão administrativa finalizada', 'info');
    navigate('/login');
  };

  const filteredPros = data.professionals.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    return !q || p.name.toLowerCase().includes(q) || p.commercialName.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q));
  });

  const selectedProObj = data.professionals.find(p => p.id === selectedProId);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '36px 0 80px' }}>
      <div className="container">
        {/* Top Admin Header Bar */}
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '20px',
          padding: '24px 28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '32px',
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <ShieldCheck size={28} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Menu de Manutenção & Administração
                </h1>
                <Badge variant="violet" style={{ backgroundColor: '#5b21b6', color: '#ede9fe' }}>
                  Painel Seguro
                </Badge>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0' }}>
                Gestão simplificada: Criação e edição de usuários, exclusão, formas de pagamento e banco de dados MySQL.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Botão Novo Usuário */}
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={() => handleOpenCreate('professional')}
              style={{ boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)' }}
            >
              + Novo Usuário
            </Button>

            {/* Botão Sincronizar MySQL */}
            <button
              onClick={handleForceSyncSeed}
              title="Carregar todos os profissionais e clientes de exemplo do MySQL"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(37, 99, 235, 0.25)',
                color: '#93c5fd',
                border: '1px solid rgba(147, 197, 253, 0.4)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Database size={15} />
              <span>Sincronizar MySQL</span>
            </button>

            <button
              onClick={fetchAdminData}
              title="Atualizar dados"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} />
              <span>Atualizar</span>
            </button>

            <button
              onClick={handleLogoutAdmin}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <LogOut size={15} />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '28px',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeTab === 'users' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'users' ? '3px solid #2563eb' : '3px solid transparent',
              marginBottom: '-2px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s'
            }}
          >
            <Users size={18} />
            <span>Gestão de Usuários</span>
            <Badge variant="primary" style={{ fontSize: '0.75rem' }}>
              {data.professionals.length + data.clients.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            style={{
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeTab === 'payments' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'payments' ? '3px solid #2563eb' : '3px solid transparent',
              marginBottom: '-2px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s'
            }}
          >
            <CreditCard size={18} />
            <span>Formas de Pagamento</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            style={{
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: activeTab === 'database' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'database' ? '3px solid #2563eb' : '3px solid transparent',
              marginBottom: '-2px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s'
            }}
          >
            <Database size={18} />
            <span>Status do Banco MySQL</span>
          </button>
        </div>

        {/* TAB 1: GESTÃO COMPLETA (CRUD) DE USUÁRIOS */}
        {activeTab === 'users' && (
          <div>
            {/* Header Seção Profissionais */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
                  Profissionais & Estabelecimentos Cadastrados ({filteredPros.length})
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                  Crie novos profissionais, edite quaisquer informações ou remova registros do MySQL.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '6px 14px',
                  minWidth: '220px'
                }}>
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Filtrar por nome ou categoria..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: 'none', outline: 'none', fontSize: '0.85rem', width: '100%' }}
                  />
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => handleOpenCreate('professional')}
                >
                  Cadastrar Profissional
                </Button>
              </div>
            </div>

            {/* Tabela de Profissionais */}
            <div className="card table-responsive" style={{ padding: 0, marginBottom: '40px' }}>
              <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '14px 20px' }}>Profissional / Estabelecimento</th>
                    <th style={{ padding: '14px 16px' }}>Categorias</th>
                    <th style={{ padding: '14px 16px' }}>Contato / E-mail</th>
                    <th style={{ padding: '14px 16px' }}>Localização</th>
                    <th style={{ padding: '14px 16px' }}>Serviços / Agendamentos</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Ações de Gestão</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPros.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                        Nenhum profissional encontrado com os critérios de busca.
                      </td>
                    </tr>
                  ) : (
                    filteredPros.map(pro => (
                      <tr key={pro.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              flexShrink: 0
                            }}>
                              {pro.name[0]}
                            </div>
                            <div>
                              <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>
                                {pro.commercialName}
                              </strong>
                              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>
                                {pro.name}
                              </span>
                              <Link
                                to={`/p/${pro.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Abrir página pública do profissional em nova aba"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  color: '#2563eb',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  marginTop: '4px'
                                }}
                              >
                                <span>Ver Perfil Público</span>
                                <ExternalLink size={12} />
                              </Link>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {(pro.categories || [pro.category]).map((c, i) => (
                              <Badge key={i} variant="violet">{c.trim().toUpperCase()}</Badge>
                            ))}
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px', color: '#334155' }}>
                          <div>{pro.email}</div>
                          <small style={{ color: '#64748b' }}>{pro.phone || 'Sem telefone'}</small>
                        </td>

                        <td style={{ padding: '14px 16px', color: '#475569', fontSize: '0.8rem' }}>
                          <div>{pro.city || 'São Paulo'} - {pro.state || 'SP'}</div>
                          <small style={{ color: '#94a3b8' }}>{pro.neighborhood || pro.street || 'Endereço cadastrado'}</small>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#475569', display: 'block' }}>
                            <strong>{pro.servicesCount || 0}</strong> serviços ativos
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#2563eb' }}>
                            <strong>{pro.bookingsCount || 0}</strong> agendamentos
                          </span>
                        </td>

                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            {/* Link Página Pública */}
                            <Link
                              to={`/p/${pro.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Acessar página pública em nova aba"
                              style={{
                                padding: '6px 10px',
                                borderRadius: '8px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                color: '#334155',
                                fontWeight: 600,
                                fontSize: '0.78rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                textDecoration: 'none',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#eff6ff';
                                e.currentTarget.style.color = '#2563eb';
                                e.currentTarget.style.borderColor = '#93c5fd';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.color = '#334155';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                              }}
                            >
                              <ExternalLink size={13} color="#2563eb" />
                              <span>Página Pública</span>
                            </Link>

                            {/* Botão Editar Profissional */}
                            <button
                              onClick={() => handleOpenEditPro(pro)}
                              title="Editar todas as informações do profissional"
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#2563eb',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#2563eb';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#eff6ff';
                                e.currentTarget.style.color = '#2563eb';
                              }}
                            >
                              <Pencil size={13} />
                              <span>Editar</span>
                            </button>

                            {/* Botão Excluir Profissional */}
                            <button
                              onClick={() => handleOpenDelete(pro, 'professional')}
                              title="Excluir profissional do MySQL"
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#dc2626',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#dc2626';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                                e.currentTarget.style.color = '#dc2626';
                              }}
                            >
                              <Trash2 size={13} />
                              <span>Excluir</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Seção Clientes Cadastrados no MySQL */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
                  Clientes Finais Cadastrados no Banco de Dados ({data.clients.length})
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
                  Usuários clientes finais registrados na tabela <code>clients</code>. Cadastre novos clientes ou edite dados existentes.
                </p>
              </div>

              {/* Botão Cadastrar Cliente */}
              <Button
                variant="outline"
                size="sm"
                icon={UserPlus}
                onClick={() => handleOpenCreate('client')}
                style={{ borderColor: '#7c3aed', color: '#7c3aed', backgroundColor: '#f5f3ff' }}
              >
                + Cadastrar Cliente
              </Button>
            </div>

            <div className="card table-responsive" style={{ padding: 0 }}>
              <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '12px 20px' }}>Nome do Cliente</th>
                    <th style={{ padding: '12px 16px' }}>E-mail</th>
                    <th style={{ padding: '12px 16px' }}>Telefone</th>
                    <th style={{ padding: '12px 16px' }}>Histórico</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right' }}>Ações de Gestão</th>
                  </tr>
                </thead>
                <tbody>
                  {data.clients.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '28px', textAlign: 'center', color: '#94a3b8' }}>
                        Nenhum cliente cadastrado no momento. Clique em "+ Cadastrar Cliente" para adicionar.
                      </td>
                    </tr>
                  ) : (
                    data.clients.map((cli, idx) => (
                      <tr key={cli.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 20px', fontWeight: 700, color: '#0f172a' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: '#f1f5f9',
                              color: '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}>
                              {cli.name?.[0] || 'C'}
                            </div>
                            <span>{cli.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          {cli.email}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          {cli.phone || 'Não informado'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <Badge variant="primary">{cli.totalBookings || 0} reserva(s)</Badge>
                        </td>
                        <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            {/* Botão Editar Cliente */}
                            <button
                              onClick={() => handleOpenEditClient(cli)}
                              title="Editar informações do cliente"
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#2563eb',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#2563eb';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#eff6ff';
                                e.currentTarget.style.color = '#2563eb';
                              }}
                            >
                              <Pencil size={12} />
                              <span>Editar</span>
                            </button>

                            {/* Botão Excluir Cliente */}
                            <button
                              onClick={() => handleOpenDelete(cli, 'client')}
                              title="Excluir cliente e reservas"
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fee2e2',
                                color: '#dc2626',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#dc2626';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                                e.currentTarget.style.color = '#dc2626';
                              }}
                            >
                              <Trash2 size={12} />
                              <span>Excluir</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: FORMAS DE PAGAMENTO POR PROFISSIONAL */}
        {activeTab === 'payments' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 800 }}>
                Cadastrar Formas de Pagamento por Profissional
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                Defina e habilite quais métodos (Pix, Cartão, Dinheiro etc.) cada estabelecimento aceita no local ou online.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* Coluna 1: Seleção do Profissional */}
              <div className="card">
                <h4 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building size={18} color="#2563eb" />
                  <span>1. Selecione o Profissional</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.professionals.map(pro => {
                    const isSelected = pro.id === selectedProId;
                    return (
                      <div
                        key={pro.id}
                        onClick={() => handleProSelect(pro.id)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: isSelected ? '#1e40af' : '#1e293b', display: 'block' }}>
                            {pro.commercialName}
                          </strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{pro.name} • {pro.city}</span>
                        </div>
                        {isSelected && <CheckCircle2 size={18} color="#2563eb" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coluna 2: Métodos de Pagamento */}
              <div className="card">
                <h4 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={18} color="#7c3aed" />
                  <span>2. Métodos Aceitos por: {selectedProObj?.commercialName || 'Selecionado'}</span>
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                  Marque ou desmarque os métodos aceitos por este profissional.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {DEFAULT_PAYMENT_OPTIONS.map(opt => {
                    const checked = selectedMethods.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: checked ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                          backgroundColor: checked ? '#f0f9ff' : '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleTogglePaymentMethod(opt.id)}
                          style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                        />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                          {opt.label}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Adicionar Método Personalizado */}
                <form onSubmit={handleAddCustomMethod} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                  <input
                    type="text"
                    placeholder="Adicionar outro método (ex: Mercado Pago, Voucher)..."
                    value={customMethod}
                    onChange={(e) => setCustomMethod(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.85rem' }}
                  />
                  <Button type="submit" variant="outline" size="sm" icon={Plus}>
                    Adicionar
                  </Button>
                </form>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Resumo dos métodos ativos:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedMethods.length > 0 ? (
                      selectedMethods.map((m, i) => (
                        <Badge key={i} variant="primary">{m}</Badge>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Nenhuma forma habilitada</span>
                    )}
                  </div>
                </div>

                <Button
                  fullWidth
                  variant="primary"
                  size="md"
                  icon={CheckCircle2}
                  loading={savingPayments}
                  onClick={handleSavePaymentMethods}
                >
                  Salvar Formas de Pagamento no MySQL
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STATUS DO BANCO MYSQL */}
        {activeTab === 'database' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 800 }}>
                Status e Integridade do Banco de Dados Local
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                Informações da conexão e tabelas ativas no MySQL Server da sua máquina.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div className="card">
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Banco de Dados Ativo</span>
                <strong style={{ fontSize: '1.3rem', color: '#2563eb', display: 'block', marginTop: '4px' }}>
                  agendamix_db
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                  <CheckCircle2 size={13} /> Conectado (localhost:3306)
                </span>
              </div>

              <div className="card">
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Profissionais no MySQL</span>
                <strong style={{ fontSize: '1.3rem', color: '#0f172a', display: 'block', marginTop: '4px' }}>
                  {data.professionals.length} registros
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', display: 'block' }}>
                  Tabela `professionals`
                </span>
              </div>

              <div className="card">
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Clientes Cadastrados</span>
                <strong style={{ fontSize: '1.3rem', color: '#7c3aed', display: 'block', marginTop: '4px' }}>
                  {data.clients.length} clientes
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', display: 'block' }}>
                  Tabela `clients`
                </span>
              </div>

              <div className="card">
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Sessão Ativa</span>
                <strong style={{ fontSize: '1.3rem', color: '#0f172a', display: 'block', marginTop: '4px' }}>
                  Administrador
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', display: 'block' }}>
                  Acesso Restrito Autorizado
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CRIAR NOVO USUÁRIO (PROFISSIONAL OU CLIENTE) */}
      {/* ======================================================== */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={createType === 'professional' ? 'Cadastrar Novo Profissional' : 'Cadastrar Novo Cliente'}
        subtitle="Armazenado e persistido diretamente no banco de dados MySQL"
        maxWidth="680px"
      >
        <form onSubmit={handleSaveCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '72vh', overflowY: 'auto', paddingRight: '4px' }}>
          {/* Seletor de Tipo: Profissional ou Cliente */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            padding: '4px',
            borderRadius: '10px',
            backgroundColor: '#f1f5f9',
            marginBottom: '6px'
          }}>
            <button
              type="button"
              onClick={() => setCreateType('professional')}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: createType === 'professional' ? '#ffffff' : 'transparent',
                color: createType === 'professional' ? '#2563eb' : '#64748b',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: createType === 'professional' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              <Briefcase size={16} />
              <span>Novo Profissional</span>
            </button>

            <button
              type="button"
              onClick={() => setCreateType('client')}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: createType === 'client' ? '#ffffff' : 'transparent',
                color: createType === 'client' ? '#7c3aed' : '#64748b',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: createType === 'client' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              <User size={16} />
              <span>Novo Cliente</span>
            </button>
          </div>

          {/* CAMPOS COMUNS */}
          <div className="form-grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nome Completo *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ex: João da Silva"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </div>

            {createType === 'professional' ? (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nome Comercial / Barbearia / Salão *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Ex: Barbearia Vip Style"
                  value={createForm.commercialName}
                  onChange={(e) => setCreateForm({ ...createForm, commercialName: e.target.value })}
                />
              </div>
            ) : (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="(11) 98765-4321"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="form-grid-2" style={{ marginTop: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">E-mail *</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="usuario@exemplo.com"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Senha {createType === 'professional' ? '(Padrão: 123456)' : '(Opcional)'}</label>
              <input
                type="password"
                className="form-input"
                placeholder="Defina a senha"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              />
            </div>
          </div>

          {/* CAMPOS ESPECÍFICOS DE PROFISSIONAL */}
          {createType === 'professional' && (
            <>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Telefone / WhatsApp Comercial</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="(11) 98765-4321"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                />
              </div>

              {/* Categorias Múltiplas */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Categorias do Estabelecimento (Clique para marcar/desmarcar)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {AVAILABLE_CATEGORIES.map(cat => {
                    const isSelected = createForm.categories.includes(cat.id);
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => {
                          if (isSelected) {
                            if (createForm.categories.length > 1) {
                              setCreateForm({
                                ...createForm,
                                categories: createForm.categories.filter(c => c !== cat.id)
                              });
                            } else {
                              addToast('Selecione pelo menos uma categoria', 'error');
                            }
                          } else {
                            setCreateForm({
                              ...createForm,
                              categories: [...createForm.categories, cat.id]
                            });
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: isSelected ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                          backgroundColor: isSelected ? '#2563eb' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#475569',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {cat.label} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Endereço Completo */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                  📍 Endereço do Estabelecimento
                </span>

                <div className="form-grid-address" style={{ marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Rua / Avenida</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Av. Paulista"
                      value={createForm.street}
                      onChange={(e) => setCreateForm({ ...createForm, street: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Número</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="1000"
                      value={createForm.number}
                      onChange={(e) => setCreateForm({ ...createForm, number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Bairro</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Bela Vista"
                      value={createForm.neighborhood}
                      onChange={(e) => setCreateForm({ ...createForm, neighborhood: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Complemento</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Sala 42 / Bloco B"
                      value={createForm.complement}
                      onChange={(e) => setCreateForm({ ...createForm, complement: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-city-state">
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Cidade</label>
                    <input
                      type="text"
                      className="form-input"
                      value={createForm.city}
                      onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Estado (UF)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={createForm.state}
                      onChange={(e) => setCreateForm({ ...createForm, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>País</label>
                    <input
                      type="text"
                      className="form-input"
                      value={createForm.country}
                      onChange={(e) => setCreateForm({ ...createForm, country: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Descrição / Bio */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Descrição / Apresentação</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Breve descrição dos serviços e diferenciais..."
                  value={createForm.bio}
                  onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="mobile-stack" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Button type="button" variant="outline" fullWidth onClick={() => setCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={savingCreate}
              icon={CheckCircle2}
            >
              Criar Usuário no MySQL
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: EDITAR QUALQUER INFORMAÇÃO DO PROFISSIONAL */}
      {/* ======================================================== */}
      <Modal
        isOpen={editProModalOpen}
        onClose={() => setEditProModalOpen(false)}
        title={`Editar Profissional: ${editProForm.commercialName}`}
        subtitle="Modifique qualquer informação cadastral salva no MySQL"
        maxWidth="700px"
      >
        <form onSubmit={handleSaveEditPro} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '74vh', overflowY: 'auto', paddingRight: '4px' }}>
          <div className="form-grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nome Completo do Responsável *</label>
              <input
                type="text"
                required
                className="form-input"
                value={editProForm.name}
                onChange={(e) => setEditProForm({ ...editProForm, name: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nome Comercial / Estabelecimento *</label>
              <input
                type="text"
                required
                className="form-input"
                value={editProForm.commercialName}
                onChange={(e) => setEditProForm({ ...editProForm, commercialName: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">E-mail de Login *</label>
              <input
                type="email"
                required
                className="form-input"
                value={editProForm.email}
                onChange={(e) => setEditProForm({ ...editProForm, email: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Telefone / WhatsApp</label>
              <input
                type="tel"
                className="form-input"
                value={editProForm.phone}
                onChange={(e) => setEditProForm({ ...editProForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Redefinir Senha (Deixe em branco para manter a senha atual)</label>
            <input
              type="password"
              className="form-input"
              placeholder="Digite uma nova senha se desejar alterá-la"
              value={editProForm.password}
              onChange={(e) => setEditProForm({ ...editProForm, password: e.target.value })}
            />
          </div>

          {/* Categorias Múltiplas */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Categorias Ativas (Clique para adicionar/remover)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
              {AVAILABLE_CATEGORIES.map(cat => {
                const isSelected = editProForm.categories.includes(cat.id);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => {
                      if (isSelected) {
                        if (editProForm.categories.length > 1) {
                          setEditProForm({
                            ...editProForm,
                            categories: editProForm.categories.filter(c => c !== cat.id)
                          });
                        } else {
                          addToast('O profissional deve possuir ao menos uma categoria', 'error');
                        }
                      } else {
                        setEditProForm({
                          ...editProForm,
                          categories: [...editProForm.categories, cat.id]
                        });
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: isSelected ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: isSelected ? '#2563eb' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#475569',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {cat.label} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Endereço Completo */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
              📍 Localização e Endereço Completo
            </span>

            <div className="form-grid-address" style={{ marginBottom: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Rua / Logradouro</label>
                <input
                  type="text"
                  className="form-input"
                  value={editProForm.street}
                  onChange={(e) => setEditProForm({ ...editProForm, street: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Número</label>
                <input
                  type="text"
                  className="form-input"
                  value={editProForm.number}
                  onChange={(e) => setEditProForm({ ...editProForm, number: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-2" style={{ marginBottom: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Bairro</label>
                <input
                  type="text"
                  className="form-input"
                  value={editProForm.neighborhood}
                  onChange={(e) => setEditProForm({ ...editProForm, neighborhood: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Complemento</label>
                <input
                  type="text"
                  className="form-input"
                  value={editProForm.complement}
                  onChange={(e) => setEditProForm({ ...editProForm, complement: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-city-state">
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Cidade</label>
                <input
                  type="text"
                  className="form-input"
                  value={editProForm.city}
                  onChange={(e) => setEditProForm({ ...editProForm, city: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Estado (UF)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editProForm.state}
                  onChange={(e) => setEditProForm({ ...editProForm, state: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>País</label>
                <input
                  type="text"
                  className="form-input"
                  value={editProForm.country}
                  onChange={(e) => setEditProForm({ ...editProForm, country: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Biografia */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Biografia / Descrição Comercial</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={editProForm.bio}
              onChange={(e) => setEditProForm({ ...editProForm, bio: e.target.value })}
            />
          </div>

          <div className="mobile-stack" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Button type="button" variant="outline" fullWidth onClick={() => setEditProModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={savingEditPro}
              icon={CheckCircle2}
            >
              Salvar Alterações no MySQL
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 3: EDITAR QUALQUER INFORMAÇÃO DO CLIENTE */}
      {/* ======================================================== */}
      <Modal
        isOpen={editClientModalOpen}
        onClose={() => setEditClientModalOpen(false)}
        title={`Editar Cliente: ${editClientForm.name}`}
        subtitle="Altere os dados cadastrais do cliente no banco de dados"
        maxWidth="500px"
      >
        <form onSubmit={handleSaveEditClient} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nome Completo *</label>
            <input
              type="text"
              required
              className="form-input"
              value={editClientForm.name}
              onChange={(e) => setEditClientForm({ ...editClientForm, name: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">E-mail *</label>
            <input
              type="email"
              required
              className="form-input"
              value={editClientForm.email}
              onChange={(e) => setEditClientForm({ ...editClientForm, email: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Telefone / WhatsApp</label>
            <input
              type="tel"
              className="form-input"
              value={editClientForm.phone}
              onChange={(e) => setEditClientForm({ ...editClientForm, phone: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Redefinir Senha (Deixe em branco para não alterar)</label>
            <input
              type="password"
              className="form-input"
              placeholder="Nova senha do cliente"
              value={editClientForm.password}
              onChange={(e) => setEditClientForm({ ...editClientForm, password: e.target.value })}
            />
          </div>

          <div className="mobile-stack" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Button type="button" variant="outline" fullWidth onClick={() => setEditClientModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={savingEditClient}
              icon={CheckCircle2}
            >
              Salvar Alterações no MySQL
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Exclusão de Usuário"
        subtitle="Atenção: Esta ação removerá os dados do banco MySQL permanentemente"
        maxWidth="480px"
      >
        <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <AlertTriangle size={30} />
          </div>

          <h4 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '8px' }}>
            Tem certeza que deseja excluir?
          </h4>

          <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, marginBottom: '20px' }}>
            {userToDelete?.type === 'professional' ? (
              <>
                Você está prestes a excluir o profissional <strong>{userToDelete?.commercialName}</strong> ({userToDelete?.name}). Todos os serviços e reservas vinculados serão apagados do MySQL.
              </>
            ) : (
              <>
                Você está prestes a excluir o cliente <strong>{userToDelete?.name}</strong> ({userToDelete?.email}) e todo o seu histórico de agendamentos.
              </>
            )}
          </p>

          <div className="mobile-stack" style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" fullWidth onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" fullWidth icon={Trash2} onClick={handleConfirmDelete}>
              Confirmar Exclusão
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
