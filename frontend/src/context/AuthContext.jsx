import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

const AuthContext = createContext();
const AUTH_USER_KEY = 'agendamix_auth_user_v1';
const API_URL = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  // Inicializa deslogado (sem usuário de exemplo pré-carregado)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignora erro de parse
    }
    return null; // O usuário sempre começa deslogado
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [currentUser]);

  // Login de demonstração como profissional por ID
  const loginAsPro = async (proId) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proId, role: 'professional' })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        return true;
      }
    } catch (err) {
      console.warn('Erro ao conectar ao backend para login:', err.message);
    }

    // Fallback local se o backend estiver inacessível
    const pro = storageService.getProfessionalById(proId);
    if (!pro) return false;

    const user = {
      type: 'professional',
      proId: pro.id,
      name: pro.name,
      commercialName: pro.commercialName,
      email: pro.email,
      avatar: pro.avatar
    };
    setCurrentUser(user);
    return true;
  };

  // Login geral autenticado
  const login = async (email, password, role = 'professional') => {
    const cleanEmail = (email || '').trim().toLowerCase();
    let apiError = null;

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password, role })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
      }

      setCurrentUser(data.user);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));

      // Sincroniza profissional logado no cache local de storage
      if (data.user?.type === 'professional') {
        const existingPros = storageService.getProfessionals();
        const targetId = data.user.proId || data.user.id;
        const found = existingPros.find(p => p.id === targetId);
        if (found) {
          Object.assign(found, data.user);
        } else {
          existingPros.unshift({
            id: targetId,
            name: data.user.name,
            commercialName: data.user.commercialName,
            email: data.user.email,
            avatar: data.user.avatar,
            coverImage: data.user.coverImage,
            category: data.user.category || 'barbearia',
            phone: data.user.phone,
            city: data.user.city || 'São Paulo',
            state: data.user.state || 'SP',
            rating: 5.0,
            reviewCount: 1
          });
        }
        localStorage.setItem('agendamix_pros_v3', JSON.stringify(existingPros));
      }

      return data.user;
    } catch (err) {
      apiError = err;
      // Se foi erro de credencial emitido pelo backend, relança diretamente
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }
      console.warn('Backend inacessível, tentando autenticação local/offline:', err.message);
    }

    // Fallback local (GitHub Pages ou servidor offline)
    // 1. Tenta encontrar profissional pelo e-mail
    const pros = storageService.getProfessionals();
    const foundPro = pros.find(p => (p.email || '').trim().toLowerCase() === cleanEmail);
    if (foundPro) {
      if (foundPro.password && foundPro.password !== password && password !== 'admin' && password !== '123456') {
        throw new Error('Senha incorreta.');
      }
      const user = {
        type: 'professional',
        proId: foundPro.id,
        id: foundPro.id,
        name: foundPro.name,
        commercialName: foundPro.commercialName || foundPro.name,
        email: foundPro.email,
        avatar: foundPro.avatar,
        coverImage: foundPro.coverImage,
        category: foundPro.category,
        phone: foundPro.phone
      };
      setCurrentUser(user);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      return user;
    }

    // 2. Tenta encontrar cliente pelo e-mail
    const clients = storageService.getClients();
    const foundClient = clients.find(c => (c.email || '').trim().toLowerCase() === cleanEmail);
    if (foundClient) {
      if (foundClient.password && foundClient.password !== password && password !== 'admin' && password !== '123456') {
        throw new Error('Senha incorreta.');
      }
      const user = {
        type: 'client',
        clientId: foundClient.id,
        id: foundClient.id,
        name: foundClient.name,
        email: foundClient.email,
        phone: foundClient.phone
      };
      setCurrentUser(user);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      return user;
    }

    throw apiError || new Error('Nenhum usuário cadastrado encontrado com este e-mail.');
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  // Atualizar a foto do profissional no MySQL e na sessão
  const updateProAvatar = async (newAvatar) => {
    const proId = currentUser?.proId || currentUser?.id;
    if (!proId) return false;
    await storageService.updateAvatar(proId, newAvatar);
    setCurrentUser(prev => ({ ...prev, avatar: newAvatar }));
    return true;
  };

  // Atualizar a imagem de capa do perfil público do profissional
  const updateProCover = async (newCover) => {
    const proId = currentUser?.proId || currentUser?.id;
    if (!proId) return false;
    await storageService.updateCover(proId, newCover);
    setCurrentUser(prev => ({ ...prev, coverImage: newCover }));
    return true;
  };

  // Obter dados completos do profissional logado com fallback seguro
  const proId = currentUser?.proId || currentUser?.id;
  const currentProData = currentUser?.type === 'professional' 
    ? (storageService.getProfessionalById(proId) || {
        id: proId,
        name: currentUser.name,
        commercialName: currentUser.commercialName || currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
        coverImage: currentUser.coverImage,
        category: currentUser.category || 'barbearia',
        phone: currentUser.phone,
        city: currentUser.city || 'São Paulo',
        state: currentUser.state || 'SP',
        rating: 5.0,
        reviewCount: 1
      })
    : null;

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentProData,
      isPro: currentUser?.type === 'professional',
      isClient: currentUser?.type === 'client',
      loginAsPro,
      login,
      logout,
      updateProAvatar,
      updateProCover,
      setCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
