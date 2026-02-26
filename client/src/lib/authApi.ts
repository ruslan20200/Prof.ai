import { apiFetch } from '@/lib/http';
import type { AuthUser, OnboardingAnswer, UserProfile } from '@/store/useStore';

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  age: number | null;
  role: 'seeker' | 'employer';
  profileSnapshot?: Partial<UserProfile>;
  onboardingAnswers?: OnboardingAnswer[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function register(payload: RegisterPayload) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function login(payload: LoginPayload) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser() {
  return apiFetch<{ user: AuthUser }>('/auth/me');
}

export function markOnboardingComplete() {
  return apiFetch<{ ok: true; onboardingComplete: boolean }>('/auth/onboarding-complete', {
    method: 'POST',
  });
}
