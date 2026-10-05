const API_URL = 'http://localhost:5000/api';

/**
 * Envia um arquivo de imagem diretamente para o backend Node.js
 * e o armazena na pasta /uploads do servidor.
 * Retorna a URL estática acessível da imagem.
 */
export async function uploadImageToBackend(file) {
  if (!file) {
    throw new Error('Nenhum arquivo selecionado.');
  }

  // Limite de 10MB
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('O arquivo excede o limite máximo permitido de 10MB.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Falha ao processar o upload no backend.');
  }

  return data.url;
}
