/**
 * Configuração centralizada da API e detecção de ambiente.
 * 
 * Regra de Segurança:
 * Em produção / GitHub Pages (qualquer domínio diferente de localhost),
 * a API_URL é estritamente null. Nenhuma requisição a localhost:5000 é disparada.
 * Isso impede que o navegador solicite permissão de rede privada/dispositivo local
 * e garante que o usuário final acesse a aplicação em modo autônomo e seguro.
 */

export const isLocalEnvironment = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

export const API_URL = isLocalEnvironment() ? 'http://localhost:5000/api' : null;
