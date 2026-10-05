import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, DollarSign, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function DashboardServices() {
  const { currentProData, isPro } = useAuth();
  const { addToast } = useToast();
  const [, setTick] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDuration, setFormDuration] = useState('30');
  const [formDescription, setFormDescription] = useState('');

  const services = currentProData?.services || [];

  const handleOpenCreateModal = () => {
    setEditingService(null);
    setFormName('');
    setFormPrice('');
    setFormDuration('30');
    setFormDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (srv) => {
    setEditingService(srv);
    setFormName(srv.name);
    setFormPrice(String(srv.price));
    setFormDuration(String(srv.duration));
    setFormDescription(srv.description || '');
    setIsModalOpen(true);
  };

  const handleSaveService = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) {
      addToast('Nome e preço são obrigatórios', 'error');
      return;
    }

    try {
      if (editingService) {
        storageService.updateService(currentProData.id, editingService.id, {
          name: formName.trim(),
          price: parseFloat(formPrice),
          duration: parseInt(formDuration, 10),
          description: formDescription.trim()
        });
        addToast('Serviço atualizado com sucesso!', 'success');
      } else {
        storageService.addService(currentProData.id, {
          name: formName.trim(),
          price: parseFloat(formPrice),
          duration: parseInt(formDuration, 10),
          description: formDescription.trim()
        });
        addToast('Novo serviço cadastrado!', 'success');
      }

      setIsModalOpen(false);
      setTick(t => t + 1);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteService = (serviceId) => {
    if (window.confirm('Tem certeza que deseja remover este serviço do catálogo?')) {
      try {
        storageService.deleteService(currentProData.id, serviceId);
        addToast('Serviço removido com sucesso.', 'info');
        setTick(t => t + 1);
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>
            Catálogo de Serviços
          </h1>
          <p style={{ color: '#64748b' }}>
            Configure os procedimentos, preços e duração estimada exibidos para seus clientes.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenCreateModal}
        >
          Cadastrar Novo Serviço
        </Button>
      </div>

      {/* Services List / Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '14px 20px' }}>Nome do Serviço</th>
              <th style={{ padding: '14px 16px' }}>Duração</th>
              <th style={{ padding: '14px 16px' }}>Valor</th>
              <th style={{ padding: '14px 16px' }}>Descrição</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {services.map((srv) => (
              <tr key={srv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 20px', fontWeight: 700, color: '#0f172a' }}>
                  {srv.name}
                </td>
                <td style={{ padding: '16px 16px', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={15} color="#2563eb" />
                    <span>{srv.duration} min</span>
                  </div>
                </td>
                <td style={{ padding: '16px 16px', fontWeight: 800, color: '#10b981' }}>
                  R$ {Number(srv.price).toFixed(2).replace('.', ',')}
                </td>
                <td style={{ padding: '16px 16px', color: '#64748b', maxWidth: '300px' }}>
                  <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {srv.description || '—'}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenEditModal(srv)}
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        color: '#2563eb',
                        cursor: 'pointer'
                      }}
                      title="Editar Serviço"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteService(srv.id)}
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        border: '1px solid #fecaca',
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}
                      title="Excluir Serviço"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Criação / Edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
        subtitle="Preencha os dados do serviço para disponibilizar aos clientes"
      >
        <form onSubmit={handleSaveService}>
          <div className="form-group">
            <label className="form-label">Nome do Serviço *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Corte Degrade Navalhado"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Preço (R$) *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="60.00"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duração (Minutos) *</label>
              <select
                className="form-select"
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
              >
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">1 hora (60 min)</option>
                <option value="75">1h 15 min</option>
                <option value="90">1h 30 min</option>
                <option value="120">2 horas (120 min)</option>
                <option value="180">3 horas (180 min)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descrição Detalhada</label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Descreva o que está incluso no procedimento, produtos utilizados..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>

          <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button variant="outline" fullWidth onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" fullWidth icon={Check}>
              Salvar Serviço
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
