import { useAuthStore } from '../store/auth';

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.bridge-us.org/api';
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

export async function uploadImage(file: File): Promise<{ id: string; url: string }> {
  const { accessToken } = useAuthStore.getState();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: formData,
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const payload = await response.json();
      message = payload.message || payload.detail || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json();
}

