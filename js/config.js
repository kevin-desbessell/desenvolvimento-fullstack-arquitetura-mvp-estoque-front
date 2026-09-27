/*
  Endereço da API de Estoque (segundo componente).
  O navegador acessa a API pela porta publicada no host (5000),
  tanto rodando localmente quanto via Docker Compose.
*/
export const API_BASE_URL = window.ESTOQUE_API_URL || "http://localhost:5000";
