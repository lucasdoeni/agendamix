import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, Phone, Building, MapPin, FileText, CheckCircle2, ArrowRight, Upload, Camera, Check, Image as ImageIcon } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { storageService } from '../services/storageService';
import { uploadImageToBackend } from '../services/uploadService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';

export default function ProRegister() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    commercialName: '',
    categories: ['barbearia'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80',
    street: '',
    number: '',
    neighborhood: '',
    complement: '',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    bio: '',
    initialServiceName: 'Atendimento Completo',
    initialServicePrice: '80'
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const toggleCategory = (catId) => {
    setFormData(prev => {
      const exists = prev.categories.includes(catId);
      const nextCategories = exists
        ? prev.categories.filter(c => c !== catId)
        : [...prev.categories, catId];
      return { ...prev, categories: nextCategories };
    });
    if (errors.categories) {
      setErrors(prev => ({ ...prev, categories: '' }));
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingAvatar(true);
      try {
        const serverUrl = await uploadImageToBackend(file);
        setFormData(prev => ({ ...prev, avatar: serverUrl }));
        addToast('Foto de perfil armazenada no servidor!', 'success');
      } catch (err) {
        addToast(err.message || 'Erro ao enviar foto para o servidor', 'error');
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingCover(true);
      try {
        const serverUrl = await uploadImageToBackend(file);
        setFormData(prev => ({ ...prev, coverImage: serverUrl }));
        addToast('Foto de capa armazenada no servidor!', 'success');
      } catch (err) {
        addToast(err.message || 'Erro ao enviar capa para o servidor', 'error');
      } finally {
        setUploadingCover(false);
      }
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Nome completo é obrigatório';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'E-mail válido é obrigatório';
    if (!formData.password || formData.password.length < 6) errs.password = 'A senha deve ter pelo menos 6 caracteres';
    if (!formData.phone.trim()) errs.phone = 'Telefone é obrigatório';
    if (!formData.commercialName.trim()) errs.commercialName = 'Nome do estabelecimento é obrigatório';
    if (!formData.categories || formData.categories.length === 0) errs.categories = 'Selecione pelo menos uma categoria';
    if (!formData.street.trim()) errs.street = 'Rua é obrigatória';
    if (!formData.number.trim()) errs.number = 'Número é obrigatório';
    if (!formData.neighborhood.trim()) errs.neighborhood = 'Bairro é obrigatório';
    if (!formData.city.trim()) errs.city = 'Cidade é obrigatória';
    if (!formData.state.trim()) errs.state = 'Estado (UF) é obrigatório';
    if (!formData.country.trim()) errs.country = 'País é obrigatório';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Por favor, preencha os campos obrigatórios em destaque.', 'error');
      return;
    }

    setLoading(true);
    try {
      const fullAddress = `Rua ${formData.street.trim()}, ${formData.number.trim()}${formData.complement.trim() ? ` - ${formData.complement.trim()}` : ''}, ${formData.neighborhood.trim()} - ${formData.city.trim()}, ${formData.state.trim()} - ${formData.country.trim()}`;

      const newPro = await storageService.registerProfessional({
        name: formData.name,
        commercialName: formData.commercialName,
        categories: formData.categories,
        category: formData.categories.join(', '),
        avatar: formData.avatar,
        coverImage: formData.coverImage,
        email: formData.email,
        phone: formData.phone,
        street: formData.street.trim(),
        number: formData.number.trim(),
        neighborhood: formData.neighborhood.trim(),
        complement: formData.complement.trim(),
        city: formData.city.trim(),
        state: formData.state.trim().toUpperCase(),
        country: formData.country.trim(),
        address: fullAddress,
        bio: formData.bio,
        services: [
          {
            id: 'srv-' + Date.now(),
            name: formData.initialServiceName || 'Atendimento Personalizado',
            price: parseFloat(formData.initialServicePrice) || 70,
            duration: 40,
            description: 'Serviço cadastrado no início da conta.'
          }
        ]
      });

      // Login automático
      setCurrentUser({
        type: 'professional',
        proId: newPro.id,
        name: newPro.name,
        commercialName: newPro.commercialName,
        email: newPro.email,
        avatar: newPro.avatar
      });

      addToast('Cadastro realizado com sucesso! Bem-vindo ao AgendaMix.', 'success');
      navigate('/painel-profissional');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '48px 0 80px' }}>
      <div className="container-sm">
        {/* Card Header */}
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
            <Sparkles size={16} />
            <span>Cadastre seu Negócio</span>
          </div>

          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>
            Comece a receber agendamentos online
          </h1>
          <p style={{ color: '#64748b', marginTop: '6px' }}>
            Crie sua conta profissional no AgendaMix em menos de 2 minutos.
          </p>
        </div>

        {/* Form Container */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Seção 1: Dados Pessoais & Acesso */}
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
              1. Dados do Responsável & Acesso
            </h3>

            <div className="form-grid-2" style={{ marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nome Completo *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Ex: Carlos Eduardo Silveira"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Telefone / WhatsApp *</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="(11) 98765-4321"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-grid-2" style={{ marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">E-mail Profissional *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="carlos@seunegocio.com.br"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Senha de Acesso *</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>
            </div>

            {/* Seção 2: Perfil Comercial & Categorias */}
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginTop: '24px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
              2. Perfil Comercial & Especialidades
            </h3>

            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label">Nome Comercial / Salão / Studio *</label>
              <input
                type="text"
                name="commercialName"
                className="form-input"
                placeholder="Ex: Barbearia Vintage Barber"
                value={formData.commercialName}
                onChange={handleChange}
              />
              {errors.commercialName && <span className="form-error">{errors.commercialName}</span>}
            </div>

            {/* Seleção de Múltiplas Categorias */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Categorias do Estabelecimento * (Selecione uma ou mais)
                </label>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {formData.categories.length} selecionada{formData.categories.length === 1 ? '' : 's'}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '10px'
              }}>
                {CATEGORIES.map(cat => {
                  const isSelected = formData.categories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                        backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                        color: isSelected ? '#1e40af' : '#475569',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left'
                      }}
                    >
                      <span>{cat.label}</span>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        border: isSelected ? '2px solid #2563eb' : '1.5px solid #cbd5e1',
                        backgroundColor: isSelected ? '#2563eb' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        flexShrink: 0
                      }}>
                        {isSelected && <Check size={14} />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.categories && <span className="form-error">{errors.categories}</span>}
            </div>

            {/* Seção 3: Endereço do Estabelecimento */}
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginTop: '24px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="#2563eb" />
              <span>3. Endereço do Estabelecimento</span>
            </h3>

            {/* Rua e Número */}
            <div className="form-grid-address" style={{ marginBottom: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Rua / Logradouro *</label>
                <input
                  type="text"
                  name="street"
                  className="form-input"
                  placeholder="Ex: Rua Oscar Freire"
                  value={formData.street}
                  onChange={handleChange}
                />
                {errors.street && <span className="form-error">{errors.street}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Número *</label>
                <input
                  type="text"
                  name="number"
                  className="form-input"
                  placeholder="Ex: 1100"
                  value={formData.number}
                  onChange={handleChange}
                />
                {errors.number && <span className="form-error">{errors.number}</span>}
              </div>
            </div>

            {/* Bairro e Complemento (opcional) */}
            <div className="form-grid-2" style={{ marginBottom: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Bairro *</label>
                <input
                  type="text"
                  name="neighborhood"
                  className="form-input"
                  placeholder="Ex: Cerqueira César"
                  value={formData.neighborhood}
                  onChange={handleChange}
                />
                {errors.neighborhood && <span className="form-error">{errors.neighborhood}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Complemento (opcional)</label>
                <input
                  type="text"
                  name="complement"
                  className="form-input"
                  placeholder="Ex: Sala 42, Bloco B (opcional)"
                  value={formData.complement}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Cidade, Estado (UF) e País */}
            <div className="form-grid-city-state" style={{ marginBottom: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Cidade *</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  placeholder="Ex: São Paulo"
                  value={formData.city}
                  onChange={handleChange}
                />
                {errors.city && <span className="form-error">{errors.city}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Estado (UF) *</label>
                <input
                  type="text"
                  name="state"
                  maxLength={2}
                  className="form-input"
                  placeholder="SP"
                  value={formData.state}
                  onChange={handleChange}
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.state && <span className="form-error">{errors.state}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">País *</label>
                <input
                  type="text"
                  name="country"
                  className="form-input"
                  placeholder="Brasil"
                  value={formData.country}
                  onChange={handleChange}
                />
                {errors.country && <span className="form-error">{errors.country}</span>}
              </div>
            </div>

            {/* Upload de Fotos de Cadastro (Armazenadas no Backend) */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} color="#2563eb" />
                <span>Fotos de Cadastro do Estabelecimento (Armazenadas no Backend)</span>
              </label>

              {/* 1. Foto de Perfil */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '16px',
                borderRadius: '12px',
                border: '1.5px dashed #cbd5e1',
                backgroundColor: '#f8fafc',
                flexWrap: 'wrap',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  border: '3px solid #2563eb',
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  backgroundColor: '#ffffff'
                }}>
                  <img
                    src={formData.avatar}
                    alt="Foto de Perfil"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: '160px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                    1. Foto de Perfil ou Logo
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={Upload}
                      loading={uploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadingAvatar ? 'Enviando ao Backend...' : 'Fazer Upload da Foto de Perfil'}
                    </Button>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                    Formatos JPG, PNG ou WEBP. Salva diretamente na pasta do servidor backend.
                  </span>
                </div>
              </div>

              {/* 2. Foto de Capa do Perfil Público */}
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                border: '1.5px dashed #cbd5e1',
                backgroundColor: '#f8fafc'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                  2. Imagem da Capa do Perfil Público (Banner)
                </span>
                
                <div style={{
                  width: '100%',
                  height: '110px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '12px',
                  backgroundColor: '#e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}>
                  <img
                    src={formData.coverImage}
                    alt="Capa do Estabelecimento"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <input
                  type="file"
                  ref={coverInputRef}
                  accept="image/*"
                  onChange={handleCoverUpload}
                  style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={Upload}
                    loading={uploadingCover}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {uploadingCover ? 'Enviando Capa...' : 'Fazer Upload da Foto de Capa'}
                  </Button>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Exibida no cabeçalho da sua página pública para os clientes.
                  </span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Biografia / Apresentação dos Serviços</label>
              <textarea
                name="bio"
                rows={3}
                className="form-textarea"
                placeholder="Conte aos clientes sobre sua experiência, produtos utilizados, técnicas e diferenciais..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            {/* Seção 3: Primeiro Serviço (sem a opção Duração Min) */}
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginTop: '24px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
              3. Cadastre seu Primeiro Serviço
            </h3>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Nome do Serviço</label>
                <input
                  type="text"
                  name="initialServiceName"
                  className="form-input"
                  placeholder="Ex: Corte Masculino Degradê"
                  value={formData.initialServiceName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preço (R$)</label>
                <input
                  type="number"
                  name="initialServicePrice"
                  className="form-input"
                  placeholder="70"
                  value={formData.initialServicePrice}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '28px' }}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                icon={CheckCircle2}
              >
                Concluir Cadastro & Abrir Meu Painel
              </Button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Já possui uma conta?{' '}
                <Link to="/login" style={{ fontWeight: 700, color: '#2563eb' }}>
                  Acesse aqui
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
