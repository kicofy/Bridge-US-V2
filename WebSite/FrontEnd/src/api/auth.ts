import { apiFetch } from './client';

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export async function sendEmailCode(email: string, purpose: 'register' | 'reset') {
  return apiFetch<{ status: string; code?: string }>('/auth/send-code', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, purpose }),
  });
}

export async function registerUser(payload: {
  email: string;
  password: string;
  display_name: string;
  code: string;
}) {
  return apiFetch<TokenResponse>('/auth/register', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: { email: string; password: string }) {
  return apiFetch<TokenResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
}

export async function logoutUser(refreshToken: string) {
  return apiFetch<{ status: string }>('/auth/logout', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function forgotPassword(payload: {
  email: string;
  code: string;
  new_password: string;
}) {
  return apiFetch<{ status: string }>('/auth/forgot-password', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload: { current_password: string; new_password: string }) {
  return apiFetch<{ status: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

