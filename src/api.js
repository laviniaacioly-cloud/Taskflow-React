import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_BASE_URL, });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
},);

api.interceptors.response.use(
  // Sucesso — retorna a resposta normalmente para o componente
  (resposta) => resposta,
  // Erro — verificar se é 401 (token inválido ou expirado)
  (erro) => {
    if (erro.response?.status === 401) {
      // Remove o token inválido do localStorage
      localStorage.removeItem("token");
      // Redireciona para o login
      window.location.href = "/login";
    }
    return Promise.reject(erro);
  },
);

export default api;