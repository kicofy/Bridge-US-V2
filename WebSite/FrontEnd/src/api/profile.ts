import { apiFetch } from './client';

export type ProfileResponse = {
  user_id: string;
  display_name: string;
  avatar_url?: string | null;
  school_level?: string | null;
  location?: string | null;
  bio?: string | null;
  credibility_score: number;
  helpfulness_score: number;
  accuracy_score: number;
};

export async function getMyProfile() {
  return apiFetch<ProfileResponse>('/profiles/me', {
    method: 'GET',
  });
}

export async function updateMyProfile(payload: {
  display_name?: string;
  avatar_url?: string | null;
  school_level?: string | null;
  location?: string | null;
  bio?: string | null;
}) {
  return apiFetch<ProfileResponse>('/profiles/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

