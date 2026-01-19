import { apiFetch } from './client';

export type VerificationStatusResponse = {
  request_id: string;
  status: string;
};

export async function getVerificationStatus() {
  return apiFetch<VerificationStatusResponse | null>('/verification/status', {
    method: 'GET',
  });
}

export async function submitVerification(docs_url: string) {
  return apiFetch<VerificationStatusResponse>('/verification/submit', {
    method: 'POST',
    body: JSON.stringify({ docs_url }),
  });
}

export async function listVerificationQueue() {
  return apiFetch<{ id: string; user_id: string; status: string }[]>('/verification/queue', {
    method: 'GET',
  });
}

export async function approveVerification(requestId: string) {
  return apiFetch<{ status: string }>(`/verification/${requestId}/approve`, {
    method: 'POST',
  });
}

export async function rejectVerification(requestId: string) {
  return apiFetch<{ status: string }>(`/verification/${requestId}/reject`, {
    method: 'POST',
  });
}

