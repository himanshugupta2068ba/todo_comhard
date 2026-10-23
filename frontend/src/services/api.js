const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const request = async (path, options = {}) => {
  const token = localStorage.getItem('todo_token');
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(body?.message || 'Request failed');
  return body;
};
