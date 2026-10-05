import { API_URL } from './apiConfig';

/**
 * Envia um arquivo de imagem diretamente para o backend Node.js (em localhost)
 * ou converte para Base64 Data URL (em produção/GitHub Pages) sem disparar
 * requisições de rede privada.
 */
export async function uploadImageToBackend(file) {
  if (!file) {
    throw new Error('Nenhum arquivo selecionado.');
  }

  // Limite de 10MB
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('O arquivo excede o limite máximo permitido de 10MB.');
  }

  // 1. Em desenvolvimento local com backend ativo
  if (API_URL) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.success) {
        return data.url;
      }
    } catch (err) {
      console.warn('Backend local indisponível para upload, convertendo para Base64 local:', err.message);
    }
  }

  // 2. Modo Autônomo / GitHub Pages / Produção: armazena como Base64 seguro
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Erro ao processar imagem localmente.'));
    reader.readAsDataURL(file);
  });
}
