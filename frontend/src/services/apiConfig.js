/**
 * Configuração centralizada da API e detecção de ambiente.
 * 
 * Regra de Segurança:
 * Em produção / GitHub Pages (qualquer domínio diferente de localhost),
 * a API_URL só é disparada caso haja uma URL segura na nuvem (VITE_API_URL).
 * NUNCA efetua requisições para 'localhost:5000' quando acessado via GitHub Pages.
 */

export const isLocalEnvironment = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

// URL da API na nuvem (definida no Render / deploy em nuvem)
export const CLOUD_API_URL = import.meta.env.VITE_API_URL || null;

export const API_URL = isLocalEnvironment() 
  ? 'http://localhost:5000/api' 
  : (CLOUD_API_URL ? `${CLOUD_API_URL.replace(/\/$/, '')}/api` : null);
