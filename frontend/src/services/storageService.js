import { INITIAL_PROFESSIONALS, INITIAL_CLIENTS, INITIAL_BOOKINGS } from '../data/mockData';

const PROS_KEY = 'agendamix_professionals_v1';
const CLIENTS_KEY = 'agendamix_clients_v1';
const BOOKINGS_KEY = 'agendamix_bookings_v1';
const API_URL = 'http://localhost:5000/api';

// Sincroniza dados com o backend MySQL na inicialização
export async function initStorage() {
  try {
    const res = await fetch(`${API_URL}/professionals`);
    if (res.ok) {
      const prosFromDb = await res.json();
      if (Array.isArray(prosFromDb) && prosFromDb.length > 0) {
        localStorage.setItem(PROS_KEY, JSON.stringify(prosFromDb));
      }
    }
  } catch {
    // Se o backend estiver indisponível no momento, usa cache local ou dados padrão
    if (!localStorage.getItem(PROS_KEY)) {
      localStorage.setItem(PROS_KEY, JSON.stringify(INITIAL_PROFESSIONALS));
    }
  }

  if (!localStorage.getItem(CLIENTS_KEY)) {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(INITIAL_CLIENTS || []));
  }

  if (!localStorage.getItem(BOOKINGS_KEY)) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
  }
}

export const storageService = {
  // PROFISSIONAIS
  getProfessionals() {
    try {
      const data = localStorage.getItem(PROS_KEY);
      return data ? JSON.parse(data) : INITIAL_PROFESSIONALS;
    } catch {
      return INITIAL_PROFESSIONALS;
    }
  },

  getProfessionalById(id) {
    const pros = this.getProfessionals();
    return pros.find(p => p.id === id) || null;
  },

  async updateAvatar(proId, avatarBase64) {
    // 1. Atualiza no MySQL
    try {
      await fetch(`${API_URL}/professionals/${proId}/avatar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarBase64 })
      });
    } catch (err) {
      console.warn('Backend offline, salvando localmente:', err.message);
    }

    // 2. Atualiza no cache local
    const pro = this.getProfessionalById(proId);
    if (pro) {
      pro.avatar = avatarBase64;
      this.saveProfessional(pro);
    }
    return avatarBase64;
  },

  async updateCover(proId, coverBase64) {
    // 1. Atualiza no MySQL
    try {
      await fetch(`${API_URL}/professionals/${proId}/cover`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverImage: coverBase64 })
      });
    } catch (err) {
      console.warn('Backend offline, salvando capa localmente:', err.message);
    }

    // 2. Atualiza no cache local
    const pro = this.getProfessionalById(proId);
    if (pro) {
      pro.coverImage = coverBase64;
      this.saveProfessional(pro);
    }
    return coverBase64;
  },

  saveProfessional(pro) {
    const pros = this.getProfessionals();
    const index = pros.findIndex(p => p.id === pro.id);
    if (index >= 0) {
      pros[index] = pro;
    } else {
      pros.unshift(pro);
    }
    localStorage.setItem(PROS_KEY, JSON.stringify(pros));
    return pro;
  },

  async registerProfessional(data) {
    // 1. Registra no backend MySQL
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const result = await res.json();
        // Atualiza profissionais do backend
        await initStorage();
        return result.user;
      }
    } catch (err) {
      console.warn('Backend MySQL offline, registrando no cache local:', err.message);
    }

    // Fallback local
    const pros = this.getProfessionals();
    const newPro = {
      id: 'pro-' + Date.now(),
      name: data.name,
      commercialName: data.commercialName || data.name,
      category: data.category || (data.categories ? data.categories.join(', ') : 'barbearia'),
      categories: data.categories || (data.category ? [data.category] : ['barbearia']),
      avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80',
      email: data.email,
      phone: data.phone,
      street: data.street || '',
      number: data.number || '',
      neighborhood: data.neighborhood || '',
      complement: data.complement || '',
      city: data.city || 'São Paulo',
      state: data.state || 'SP',
      country: data.country || 'Brasil',
      address: data.address,
      rating: 5.0,
      reviewCount: 1,
      bio: data.bio || 'Profissional especialista dedicado à beleza e ao bem-estar dos clientes.',
      featured: false,
      schedule: {
        daysOfWeek: [1, 2, 3, 4, 5, 6],
        startHour: '09:00',
        endHour: '18:00',
        lunchStart: '12:00',
        lunchEnd: '13:00',
        slotInterval: 30
      },
      blockedSlots: [],
      services: [
        {
          id: 'srv-' + Date.now(),
          name: data.initialServiceName || 'Atendimento Personalizado',
          price: parseFloat(data.initialServicePrice) || 70,
          duration: 40,
          description: 'Serviço cadastrado no início da conta.'
        }
      ]
    };

    pros.unshift(newPro);
    localStorage.setItem(PROS_KEY, JSON.stringify(pros));
    return newPro;
  },

  // SERVIÇOS DO PROFISSIONAL
  async addService(proId, serviceData) {
    const pro = this.getProfessionalById(proId);
    if (!pro) throw new Error('Profissional não encontrado');

    const newService = {
      id: 'srv-' + Date.now(),
      name: serviceData.name,
      price: parseFloat(serviceData.price),
      duration: parseInt(serviceData.duration, 10),
      description: serviceData.description || ''
    };

    // Sincroniza com MySQL
    try {
      await fetch(`${API_URL}/professionals/${proId}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      });
    } catch (err) {
      console.warn('Erro ao salvar serviço no MySQL:', err.message);
    }

    pro.services.push(newService);
    this.saveProfessional(pro);
    return newService;
  },

  async updateService(proId, serviceId, updatedData) {
    const pro = this.getProfessionalById(proId);
    if (!pro) throw new Error('Profissional não encontrado');

    const index = pro.services.findIndex(s => s.id === serviceId);
    if (index === -1) throw new Error('Serviço não encontrado');

    pro.services[index] = {
      ...pro.services[index],
      ...updatedData,
      price: parseFloat(updatedData.price),
      duration: parseInt(updatedData.duration, 10)
    };

    // Sincroniza com MySQL
    try {
      await fetch(`${API_URL}/professionals/${proId}/services/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    } catch (err) {
      console.warn('Erro ao atualizar serviço no MySQL:', err.message);
    }

    this.saveProfessional(pro);
    return pro.services[index];
  },

  async deleteService(proId, serviceId) {
    const pro = this.getProfessionalById(proId);
    if (!pro) throw new Error('Profissional não encontrado');

    pro.services = pro.services.filter(s => s.id !== serviceId);

    // Sincroniza com MySQL
    try {
      await fetch(`${API_URL}/professionals/${proId}/services/${serviceId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Erro ao deletar serviço no MySQL:', err.message);
    }

    this.saveProfessional(pro);
    return true;
  },

  // HORÁRIOS & BLOQUEIOS
  async updateSchedule(proId, scheduleConfig) {
    const pro = this.getProfessionalById(proId);
    if (!pro) throw new Error('Profissional não encontrado');

    pro.schedule = { ...pro.schedule, ...scheduleConfig };

    // Sincroniza com MySQL
    try {
      await fetch(`${API_URL}/professionals/${proId}/schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleConfig)
      });
    } catch (err) {
      console.warn('Erro ao salvar horários no MySQL:', err.message);
    }

    this.saveProfessional(pro);
    return pro.schedule;
  },

  async addBlockedSlot(proId, blockedSlot) {
    const pro = this.getProfessionalById(proId);
    if (!pro) throw new Error('Profissional não encontrado');

    if (!pro.blockedSlots) pro.blockedSlots = [];
    pro.blockedSlots.push(blockedSlot);

    // Sincroniza com MySQL
    try {
      await fetch(`${API_URL}/professionals/${proId}/blocked-slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockedSlot)
      });
    } catch (err) {
      console.warn('Erro ao gravar bloqueio no MySQL:', err.message);
    }

    this.saveProfessional(pro);
    return pro.blockedSlots;
  },

  async removeBlockedSlot(proId, index) {
    const pro = this.getProfessionalById(proId);
    if (!pro) throw new Error('Profissional não encontrado');

    const slot = pro.blockedSlots?.[index];
    if (pro.blockedSlots) {
      pro.blockedSlots.splice(index, 1);
    }

    // Sincroniza com MySQL
    if (slot?.id) {
      try {
        await fetch(`${API_URL}/professionals/${proId}/blocked-slots/${slot.id}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.warn('Erro ao remover bloqueio no MySQL:', err.message);
      }
    }

    this.saveProfessional(pro);
    return pro.blockedSlots;
  },

  // AGENDAMENTOS
  getBookings() {
    try {
      const data = localStorage.getItem(BOOKINGS_KEY);
      return data ? JSON.parse(data) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  },

  getBookingsByPro(proId) {
    const bookings = this.getBookings();
    return bookings.filter(b => b.proId === proId);
  },

  getBookingsByClient(query) {
    if (!query) return [];
    const clean = query.trim().toLowerCase();
    const bookings = this.getBookings();
    return bookings.filter(b => 
      (b.clientEmail && b.clientEmail.toLowerCase() === clean) ||
      (b.clientPhone && b.clientPhone.replace(/\D/g, '') === clean.replace(/\D/g, '')) ||
      (b.clientName && b.clientName.toLowerCase().includes(clean))
    );
  },

  async createBooking(bookingData) {
    // 1. Tenta salvar e validar conflito no MySQL
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao registrar reserva no banco de dados.');
      }

      const createdFromDb = await res.json();
      const bookings = this.getBookings();
      bookings.unshift(createdFromDb);
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
      return createdFromDb;
    } catch (err) {
      if (err.message.includes('Este horário já foi reservado')) {
        throw err;
      }
      console.warn('Backend MySQL inacessível, processando reserva local:', err.message);
    }

    // Validação local anti-conflito
    const bookings = this.getBookings();
    const hasConflict = bookings.some(b => 
      b.proId === bookingData.proId &&
      b.date === bookingData.date &&
      b.time === bookingData.time &&
      b.status !== 'cancelled'
    );

    if (hasConflict) {
      throw new Error('Este horário já foi reservado por outro cliente. Por favor, escolha outro horário.');
    }

    const newBooking = {
      id: 'bkg-' + Date.now(),
      ...bookingData,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    bookings.unshift(newBooking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    return newBooking;
  },

  async updateBookingStatus(bookingId, newStatus) {
    // 1. Sincroniza com MySQL
    try {
      await fetch(`${API_URL}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.warn('Erro ao atualizar status no MySQL:', err.message);
    }

    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index === -1) throw new Error('Agendamento não encontrado');

    bookings[index].status = newStatus;
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    return bookings[index];
  },

  // CLIENTES
  getClients() {
    try {
      const data = localStorage.getItem(CLIENTS_KEY);
      return data ? JSON.parse(data) : (INITIAL_CLIENTS || []);
    } catch {
      return INITIAL_CLIENTS || [];
    }
  },

  // PORTAL DE MANUTENÇÃO / ADMIN
  async getAdminData() {
    // 1. Tenta carregar dados do servidor MySQL
    try {
      const res = await fetch(`${API_URL}/admin/users`);
      if (res.ok) {
        const result = await res.json();
        if (result.professionals && Array.isArray(result.professionals)) {
          localStorage.setItem(PROS_KEY, JSON.stringify(result.professionals));
        }
        if (result.clients && Array.isArray(result.clients)) {
          localStorage.setItem(CLIENTS_KEY, JSON.stringify(result.clients));
        }
        return {
          professionals: result.professionals || [],
          clients: result.clients || [],
          isOnline: true
        };
      }
    } catch (err) {
      console.warn('Backend MySQL offline ou indisponível (usando cache local/demo):', err.message);
    }

    // 2. Fallback automático seguro (modo offline / GitHub Pages)
    const pros = this.getProfessionals();
    const clients = this.getClients();
    const bookings = this.getBookings();

    const enrichedPros = pros.map(p => ({
      ...p,
      categories: p.categories || (p.category ? p.category.split(',').map(m => m.trim()) : ['barbearia']),
      paymentMethods: p.paymentMethods || (p.payment_methods ? p.payment_methods.split(',').map(m => m.trim()) : ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro']),
      servicesCount: Array.isArray(p.services) ? p.services.length : 0,
      bookingsCount: bookings.filter(b => b.proId === p.id).length
    }));

    const enrichedClients = clients.map(c => {
      const clientBookings = bookings.filter(b => b.clientEmail === c.email || b.clientPhone === c.phone);
      return {
        ...c,
        totalBookings: clientBookings.length,
        lastBookingDate: clientBookings.length > 0 ? clientBookings[0].createdAt : null
      };
    });

    return {
      professionals: enrichedPros,
      clients: enrichedClients,
      isOnline: false
    };
  },

  async createAdminUser(userData, userType = 'professional') {
    // 1. Tenta MySQL
    try {
      const res = await fetch(`${API_URL}/admin/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType, ...userData })
      });
      if (res.ok) {
        const result = await res.json();
        return { success: true, message: result.message, id: result.id };
      }
    } catch (err) {
      console.warn('Backend offline, salvando usuário localmente:', err.message);
    }

    // 2. Fallback local
    if (userType === 'professional') {
      const pros = this.getProfessionals();
      const newPro = {
        id: 'pro-' + Date.now(),
        name: userData.name,
        commercialName: userData.commercialName,
        category: Array.isArray(userData.categories) ? userData.categories[0] : (userData.category || 'barbearia'),
        categories: userData.categories || ['barbearia'],
        email: userData.email,
        phone: userData.phone || '',
        street: userData.street || '',
        number: userData.number || '',
        neighborhood: userData.neighborhood || '',
        complement: userData.complement || '',
        city: userData.city || 'São Paulo',
        state: userData.state || 'SP',
        country: userData.country || 'Brasil',
        address: userData.address || `${userData.street || ''}, ${userData.number || ''}`,
        bio: userData.bio || 'Profissional cadastrado.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80',
        rating: 5.0,
        reviewCount: 1,
        featured: false,
        paymentMethods: userData.paymentMethods || ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'],
        services: [
          { id: 'srv-' + Date.now(), name: 'Atendimento Personalizado', price: 60, duration: 40, description: 'Serviço padrão' }
        ],
        schedule: { daysOfWeek: [1,2,3,4,5,6], startHour: '09:00', endHour: '19:00', lunchStart: '12:00', lunchEnd: '13:00', slotInterval: 30 }
      };
      pros.unshift(newPro);
      localStorage.setItem(PROS_KEY, JSON.stringify(pros));
      return { success: true, message: `Profissional "${newPro.commercialName}" cadastrado com sucesso!`, id: newPro.id };
    } else {
      const clients = this.getClients();
      const newClient = {
        id: 'cli-' + Date.now(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        createdAt: new Date().toISOString(),
        totalBookings: 0,
        lastBookingDate: null
      };
      clients.unshift(newClient);
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
      return { success: true, message: `Cliente "${newClient.name}" cadastrado com sucesso!`, id: newClient.id };
    }
  },

  async updateAdminPro(id, updateData) {
    // 1. Tenta MySQL
    try {
      const res = await fetch(`${API_URL}/admin/professionals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        const result = await res.json();
        return { success: true, message: result.message };
      }
    } catch (err) {
      console.warn('Backend offline, atualizando profissional localmente:', err.message);
    }

    // 2. Fallback local
    const pros = this.getProfessionals();
    const idx = pros.findIndex(p => p.id === id);
    if (idx !== -1) {
      pros[idx] = { ...pros[idx], ...updateData };
      localStorage.setItem(PROS_KEY, JSON.stringify(pros));
      return { success: true, message: `Profissional "${pros[idx].commercialName}" atualizado com sucesso!` };
    }
    return { success: false, message: 'Profissional não encontrado.' };
  },

  async updateAdminClient(id, updateData) {
    // 1. Tenta MySQL
    try {
      const res = await fetch(`${API_URL}/admin/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        const result = await res.json();
        return { success: true, message: result.message };
      }
    } catch (err) {
      console.warn('Backend offline, atualizando cliente localmente:', err.message);
    }

    // 2. Fallback local
    const clients = this.getClients();
    const idx = clients.findIndex(c => c.id === id || c.email === id);
    if (idx !== -1) {
      clients[idx] = { ...clients[idx], ...updateData };
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
      return { success: true, message: `Cliente "${clients[idx].name}" atualizado com sucesso!` };
    }
    return { success: false, message: 'Cliente não encontrado.' };
  },

  async deleteAdminPro(id) {
    // 1. Tenta MySQL
    try {
      const res = await fetch(`${API_URL}/admin/professionals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const result = await res.json();
        return { success: true, message: result.message };
      }
    } catch (err) {
      console.warn('Backend offline, excluindo profissional localmente:', err.message);
    }

    // 2. Fallback local
    const pros = this.getProfessionals();
    const filtered = pros.filter(p => p.id !== id);
    localStorage.setItem(PROS_KEY, JSON.stringify(filtered));
    return { success: true, message: 'Profissional excluído com sucesso!' };
  },

  async deleteAdminClient(id, email, phone) {
    // 1. Tenta MySQL
    try {
      const res = await fetch(`${API_URL}/admin/clients/${id || ''}?email=${encodeURIComponent(email || '')}&phone=${encodeURIComponent(phone || '')}`, { method: 'DELETE' });
      if (res.ok) {
        const result = await res.json();
        return { success: true, message: result.message };
      }
    } catch (err) {
      console.warn('Backend offline, excluindo cliente localmente:', err.message);
    }

    // 2. Fallback local
    const clients = this.getClients();
    const filtered = clients.filter(c => c.id !== id && c.email !== email);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(filtered));
    return { success: true, message: 'Cliente excluído com sucesso!' };
  },

  async updateAdminPaymentMethods(id, paymentMethods) {
    // 1. Tenta MySQL
    try {
      const res = await fetch(`${API_URL}/admin/professionals/${id}/payment-methods`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethods })
      });
      if (res.ok) {
        const result = await res.json();
        return { success: true, message: result.message };
      }
    } catch (err) {
      console.warn('Backend offline, salvando formas de pagamento localmente:', err.message);
    }

    // 2. Fallback local
    const pros = this.getProfessionals();
    const idx = pros.findIndex(p => p.id === id);
    if (idx !== -1) {
      pros[idx].paymentMethods = paymentMethods;
      localStorage.setItem(PROS_KEY, JSON.stringify(pros));
      return { success: true, message: 'Formas de pagamento atualizadas com sucesso!' };
    }
    return { success: false, message: 'Profissional não encontrado.' };
  },

  resetToDefault() {
    localStorage.setItem(PROS_KEY, JSON.stringify(INITIAL_PROFESSIONALS));
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(INITIAL_CLIENTS || []));
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
  }
};
