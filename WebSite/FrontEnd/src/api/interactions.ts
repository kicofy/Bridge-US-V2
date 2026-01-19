import { apiFetch } from './client';

export async function markPostHelpful(postId: string) {
  return apiFetch<{ status: string }>(`/interactions/posts/${postId}/helpful`, {
    method: 'POST',
  });
}

export async function unmarkPostHelpful(postId: string) {
  return apiFetch<{ status: string }>(`/interactions/posts/${postId}/helpful`, {
    method: 'DELETE',
  });
}

export async function markReplyHelpful(replyId: string) {
  return apiFetch<{ status: string }>(`/interactions/replies/${replyId}/helpful`, {
    method: 'POST',
  });
}

export async function unmarkReplyHelpful(replyId: string) {
  return apiFetch<{ status: string }>(`/interactions/replies/${replyId}/helpful`, {
    method: 'DELETE',
  });
}

export async function submitAccuracy(postId: string, rating: number, note?: string) {
  return apiFetch<{ status: string }>(`/interactions/posts/${postId}/accuracy`, {
    method: 'POST',
    body: JSON.stringify({ rating, note }),
  });
}

export async function updateAccuracy(postId: string, rating: number, note?: string) {
  return apiFetch<{ status: string }>(`/interactions/posts/${postId}/accuracy`, {
    method: 'PUT',
    body: JSON.stringify({ rating, note }),
  });
}

export async function deleteAccuracy(postId: string) {
  return apiFetch<{ status: string }>(`/interactions/posts/${postId}/accuracy`, {
    method: 'DELETE',
  });
}

