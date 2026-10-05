import { INITIAL_PROFESSIONALS, INITIAL_CLIENTS, INITIAL_BOOKINGS } from '../data/mockData';
import { API_URL } from './apiConfig';

const PROS_KEY = 'agendamix_pros_v3';
const CLIENTS_KEY = 'agendamix_clients_v3';
const BOOKINGS_KEY = 'agendamix_bookings_v3';

// Mescla listas garantindo que todos os itens da base estejam sempre presentes
function mergeListById(existingList, baseList) {
  const map = new Map();
  // 1. Prioriza a base com todos os dados do banco/seed
  (baseList || []).forEach(item => {
    if (item && item.id) map.set(item.id, item);
  });
  // 2. Mescla com os itens existentes criados/alterados pelo usuário
  (existingList || []).forEach(item => {
    if (item && item.id) {
      const existing = map.get(item.id) || {};
      map.set(item.id, { ...existing, ...item });
    }
  });
  return Array.from(map.values());
}

// Executa requisições ao backend APENAS quando API_URL existir (ambiente local de dev)
async function safeFetch(endpoint, options = {}) {
  if (!API_URL) return null;
  try {
    return await fetch(`${API_URL}${endpoint}`, options);
  } catch (err) {
    return null;
  }
}

// Sincroniza dados com o backend MySQL ou com o dump estático na inicialização
export async function initStorage() {
  // Limpa chaves legadas antigas
  try {
    localStorage.removeItem('agendamix_professionals_v1');
    localStorage.removeItem('agendamix_clients_v1');
    localStorage.removeItem('agendamix_bookings_v1');
    localStorage.removeItem('agendamix_pros_v2');
  } catch {}

  // 1. Tenta carregar do backend MySQL local APENAS se estiver em localhost de desenvolvimento
  try {
    const res = await safeFetch('/professionals');
    if (res && res.ok) {
      const prosFromDb = await res.json();
      if (Array.isArray(prosFromDb) && prosFromDb.length > 0) {
        localStorage.setItem(PROS_KEY, JSON.stringify(prosFromDb));
      }
    }
  } catch {}

  // 2. Tenta carregar dump estático do MySQL (para GitHub Pages / offline)
  try {
    const dumpRes = await fetch('./data/api-dump.json');
    if (dumpRes.ok) {
      const dumpData = await dumpRes.json();
      if (dumpData.professionals && Array.isArray(dumpData.professionals)) {
        const merged = mergeListById(storageService.getProfessionals(), dumpData.professionals);
        localStorage.setItem(PROS_KEY, JSON.stringify(merged));
      }
      if (dumpData.clients && Array.isArray(dumpData.clients)) {
        const mergedClients = mergeListById(storageService.getClients(), dumpData.clients);
        localStorage.setItem(CLIENTS_KEY, JSON.stringify(mergedClients));
      }
      if (dumpData.bookings && Array.isArray(dumpData.bookings)) {
        const mergedBookings = mergeListById(storageService.getBookings(), dumpData.bookings);
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(mergedBookings));
      }
      return;
    }
  } catch {}

  // 3. Fallback com dados embutidos
  const currentPros = storageService.getProfessionals();
  localStorage.setItem(PROS_KEY, JSON.stringify(mergeListById(currentPros, INITIAL_PROFESSIONALS)));

  const currentClients = storageService.getClients();
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(mergeListById(currentClients, INITIAL_CLIENTS)));

  const currentBookings = storageService.getBookings();
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(mergeListById(currentBookings, INITIAL_BOOKINGS)));
}

export const storageService = {
  // PROFISSIONAIS
  getProfessionals() {
    try {
      const raw = localStorage.getItem(PROS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return mergeListById(parsed, INITIAL_PROFESSIONALS);
    } catch {
      return INITIAL_PROFESSIONALS;
    }
  },

  getProfessionalById(id) {
    const pros = this.getProfessionals();
    return pros.find(p => p.id === id) || null;
  },

  async updateAvatar(proId, avatarBase64) {
    // 1. Atualiza no MySQL (apenas se em dev local)
    try {
      await safeFetch(`/professionals/${proId}/avatar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarBase64 })
      });
    } catch (err) {}

    // 2. Atualiza no cache local
    const pro = this.getProfessionalById(proId);
    if (pro) {
      pro.avatar = avatarBase64;
      this.saveProfessional(pro);
    }
    return avatarBase64;
  },

  async updateCover(proId, coverBase64) {
    // 1. Atualiza no MySQL (apenas se em dev local)
    try {
      await safeFetch(`/professionals/${proId}/cover`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverImage: coverBase64 })
      });
    } catch (err) {}

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
    // 1. Registra no backend MySQL (se dev local)
    try {
      const res = await safeFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res && res.ok) {
        const result = await res.json();
        await initStorage();
        return result.user;
      }
    } catch (err) {}

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

    // Sincroniza com MySQL (se dev local)
    try {
      await safeFetch(`/professionals/${proId}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      });
    } catch (err) {}

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

    // Sincroniza com MySQL (se dev local)
    try {
      await safeFetch(`/professionals/${proId}/services/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    } catch (err) {}

    this.saveProfessional(pro);
    return pro.services[index];
  },

  async deleteService(proId, serviceId) {
    const pro = this.getProfessionalById(proId);
    if (!pro) throw new Error('Profissional não encontrado');

    pro.services = pro.services.filter(s => s.id !== serviceId);

    // Sincroniza com MySQL (se dev local)
    try {
      await safeFetch(`/professionals/${proId}/services/${serviceId}`, {
        method: 'DELETE'
      });
    } catch (err) {}

    this.saveProfessional(pro);
    return true;
  },

  // HORÁRIOS & BLOQUEIOS
  async updateSchedule(proId, scheduleConfig) {
    const pro = this.getProfessionalById(proId);
    if (!pro) throw new Error('Profissional não encontrado');

    pro.schedule = { ...pro.schedule, ...scheduleConfig };

    // Sincroniza com MySQL (se dev local)
    try {
      await safeFetch(`/professionals/${proId}/schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleConfig)
      });
    } catch (err) {}

    this.saveProfessional(pro);
    return pro.schedule;
  },

  async addBlockedSlot(proId, blockedSlot) {
    const pro = this.getProfessionalById(proId);
    if (!pro) throw new Error('Profissional não encontrado');

    if (!pro.blockedSlots) pro.blockedSlots = [];
    pro.blockedSlots.push(blockedSlot);

    // Sincroniza com MySQL (se dev local)
    try {
      await safeFetch(`/professionals/${proId}/blocked-slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockedSlot)
      });
    } catch (err) {}

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

    // Sincroniza com MySQL (se dev local)
    if (slot?.id) {
      try {
        await safeFetch(`/professionals/${proId}/blocked-slots/${slot.id}`, {
          method: 'DELETE'
        });
      } catch (err) {}
    }

    this.saveProfessional(pro);
    return pro.blockedSlots;
  },

  // AGENDAMENTOS
  getBookings() {
    try {
      const raw = localStorage.getItem(BOOKINGS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return mergeListById(parsed, INITIAL_BOOKINGS || []);
    } catch {
      return INITIAL_BOOKINGS || [];
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
    // 1. Tenta salvar e validar conflito no MySQL (se dev local)
    try {
      const res = await safeFetch('/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (res) {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Erro ao registrar reserva no banco de dados.');
        }

        const createdFromDb = await res.json();
        const bookings = this.getBookings();
        bookings.unshift(createdFromDb);
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
        return createdFromDb;
      }
    } catch (err) {
      if (err.message.includes('Este horário já foi reservado')) {
        throw err;
      }
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
    // 1. Sincroniza com MySQL (se dev local)
    try {
      await safeFetch(`/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {}

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
      const raw = localStorage.getItem(CLIENTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return mergeListById(parsed, INITIAL_CLIENTS || []);
    } catch {
      return INITIAL_CLIENTS || [];
    }
  },

  // PORTAL DE MANUTENÇÃO / ADMIN
  async getAdminData() {
    // 1. Tenta carregar dados do servidor MySQL (se dev local)
    try {
      const res = await safeFetch('/admin/users');
      if (res && res.ok) {
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
    } catch {}

    // 2. Se backend offline (GitHub Pages / demo), carrega do dump estático oficial do MySQL
    try {
      const dumpRes = await fetch('./data/api-dump.json');
      if (dumpRes.ok) {
        const dump = await dumpRes.json();
        if (dump.professionals && Array.isArray(dump.professionals)) {
          const mergedPros = mergeListById(storageService.getProfessionals(), dump.professionals);
          localStorage.setItem(PROS_KEY, JSON.stringify(mergedPros));
        }
        if (dump.clients && Array.isArray(dump.clients)) {
          const mergedClients = mergeListById(storageService.getClients(), dump.clients);
          localStorage.setItem(CLIENTS_KEY, JSON.stringify(mergedClients));
        }
        return {
          professionals: dump.professionals || [],
          clients: dump.clients || [],
          isOnline: false
        };
      }
    } catch {}

    // 3. Fallback automático com mesclagem dos dados locais
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
    // 1. Tenta MySQL (se dev local)
    try {
      const res = await safeFetch('/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType, ...userData })
      });
      if (res && res.ok) {
        const result = await res.json();
        return { success: true, message: result.message, id: result.id };
      }
    } catch (err) {}

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
    // 1. Tenta MySQL (se dev local)
    try {
      const res = await safeFetch(`/admin/professionals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res && res.ok) {
        const result = await res.json();
        return { success: true, message: result.message };
      }
    } catch (err) {}

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
    // 1. Tenta MySQL (se dev local)
    try {
      const res = await safeFetch(`/admin/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res && res.ok) {
        const result = await res.json();
        return { success: true, message: result.message };
      }
    } catch (err) {}

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
    // 1. Tenta MySQL (se dev local)
    try {
      const res = await safeFetch(`/admin/professionals/${id}`, { method: 'DELETE' });
      if (res && res.ok) {
        const result = await res.json();
        return { success: true, message: result.message };
      }
    } catch (err) {}

    // 2. Fallback local
    const pros = this.getProfessionals();
    const filtered = pros.filter(p => p.id !== id);
    localStorage.setItem(PROS_KEY, JSON.stringify(filtered));
    return { success: true, message: 'Profissional excluído com sucesso!' };
  },

  async deleteAdminClient(id, email, phone) {
    // 1. Tenta MySQL (se dev local)
    try {
      const res = await safeFetch(`/admin/clients/${id || ''}?email=${encodeURIComponent(email || '')}&phone=${encodeURIComponent(phone || '')}`, { method: 'DELETE' });
      if (res && res.ok) {
        const result = await res.json();
        return { success: true, message: result.message };
      }
    } catch (err) {}

    // 2. Fallback local
    const clients = this.getClients();
    const filtered = clients.filter(c => c.id !== id && c.email !== email);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(filtered));
    return { success: true, message: 'Cliente excluído com sucesso!' };
  },

  async updateAdminPaymentMethods(id, paymentMethods) {
    // 1. Tenta MySQL (se dev local)
    try {
      const res = await safeFetch(`/admin/professionals/${id}/payment-methods`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethods })
      });
      if (res && res.ok) {
        const result = await res.json();
        return { success: true, message: result.message };
      }
    } catch (err) {}

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

  async syncFromMySQLSeed() {
    try {
      const dumpRes = await fetch('./data/api-dump.json');
      if (dumpRes.ok) {
        const dump = await dumpRes.json();
        if (dump.professionals) localStorage.setItem(PROS_KEY, JSON.stringify(dump.professionals));
        if (dump.clients) localStorage.setItem(CLIENTS_KEY, JSON.stringify(dump.clients));
        if (dump.bookings) localStorage.setItem(BOOKINGS_KEY, JSON.stringify(dump.bookings));
        return { success: true, countPros: dump.professionals.length, countClients: dump.clients.length };
      }
    } catch {}

    localStorage.setItem(PROS_KEY, JSON.stringify(INITIAL_PROFESSIONALS));
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(INITIAL_CLIENTS || []));
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
    return { success: true, countPros: INITIAL_PROFESSIONALS.length, countClients: (INITIAL_CLIENTS || []).length };
  },

  resetToDefault() {
    localStorage.setItem(PROS_KEY, JSON.stringify(INITIAL_PROFESSIONALS));
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(INITIAL_CLIENTS || []));
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
  }
};
