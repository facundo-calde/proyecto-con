const LOCAL_API = "http://localhost:5000/api";
const LAN_API = "http://192.168.0.4:5000/api"; // IP de tu servidor

const API_BASE_URL = window.location.hostname === "localhost" ? LOCAL_API : LAN_API;

export const API_ENDPOINTS = {
  billeteras: `${API_BASE_URL}/wallets`,
  depositos: `${API_BASE_URL}/depositos`,
  gastos: `${API_BASE_URL}/gastos`,
  jobs: `${API_BASE_URL}/jobs`,
  movimientos: `${API_BASE_URL}/movimientos`,
  propinas: `${API_BASE_URL}/propinas`,
  transferencia: `${API_BASE_URL}/wallets/transferencia`,
  users: `${API_BASE_URL}/users`
};
