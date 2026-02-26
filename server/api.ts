import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { requireAuth, requireRole, signAuthToken } from './auth';
import { query } from './db';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  age: z.number().int().min(14).max(99).nullable(),
  role: z.enum(['seeker', 'employer']),
  profileSnapshot: z.record(z.string(), z.unknown()).optional(),
  onboardingAnswers: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function createApiRouter() {
  const router = Router();

  router.post('/auth/register', async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
      return;
    }

    const { email, password, fullName, age, role, profileSnapshot, onboardingAnswers } = parsed.data;
    const mappedRole = role === 'seeker' ? 'candidate' : 'employer';

    try {
      const existing = await query<{ id: string }>('select id from public.app_users where email = $1', [email]);
      if (existing.rows.length > 0) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const created = await query<{
        id: string;
        email: string;
        full_name: string;
        age: number | null;
        role: 'candidate' | 'employer' | 'super_admin';
        onboarding_completed: boolean;
        profile_snapshot: Record<string, unknown> | null;
        onboarding_answers: Array<{ question: string; answer: string }> | null;
      }>(
        `
          insert into public.app_users (email, password_hash, full_name, age, role, onboarding_completed, profile_snapshot, onboarding_answers)
          values ($1, $2, $3, $4, $5, false, $6, $7)
          returning id, email, full_name, age, role, onboarding_completed, profile_snapshot, onboarding_answers
        `,
        [email, passwordHash, fullName, age, mappedRole, profileSnapshot ?? null, onboardingAnswers ?? null]
      );

      const user = created.rows[0];
      const token = signAuthToken({
        sub: user.id,
        role: user.role,
        email: user.email,
      });

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          age: user.age,
          role: user.role === 'candidate' ? 'seeker' : user.role,
          onboardingComplete: user.onboarding_completed,
          profileSnapshot: user.profile_snapshot,
          onboardingAnswers: user.onboarding_answers,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to register user', details: String(error) });
    }
  });

  router.post('/auth/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
      return;
    }

    try {
      const { email, password } = parsed.data;
      const userResult = await query<{
        id: string;
        email: string;
        full_name: string;
        age: number | null;
        role: 'candidate' | 'employer' | 'super_admin';
        onboarding_completed: boolean;
        password_hash: string;
        profile_snapshot: Record<string, unknown> | null;
        onboarding_answers: Array<{ question: string; answer: string }> | null;
      }>(
        `
          select id, email, full_name, age, role, onboarding_completed, password_hash, profile_snapshot, onboarding_answers
          from public.app_users
          where email = $1
        `,
        [email]
      );

      const user = userResult.rows[0];
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = signAuthToken({
        sub: user.id,
        role: user.role,
        email: user.email,
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          age: user.age,
          role: user.role === 'candidate' ? 'seeker' : user.role,
          onboardingComplete: user.onboarding_completed,
          profileSnapshot: user.profile_snapshot,
          onboardingAnswers: user.onboarding_answers,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to login', details: String(error) });
    }
  });

  router.get('/auth/me', requireAuth, async (req, res) => {
    try {
      const userResult = await query<{
        id: string;
        email: string;
        full_name: string;
        age: number | null;
        role: 'candidate' | 'employer' | 'super_admin';
        onboarding_completed: boolean;
        profile_snapshot: Record<string, unknown> | null;
        onboarding_answers: Array<{ question: string; answer: string }> | null;
      }>(
        `
          select id, email, full_name, age, role, onboarding_completed, profile_snapshot, onboarding_answers
          from public.app_users
          where id = $1
        `,
        [req.auth!.userId]
      );

      const user = userResult.rows[0];
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          age: user.age,
          role: user.role === 'candidate' ? 'seeker' : user.role,
          onboardingComplete: user.onboarding_completed,
          profileSnapshot: user.profile_snapshot,
          onboardingAnswers: user.onboarding_answers,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user', details: String(error) });
    }
  });

  router.post('/auth/onboarding-complete', requireAuth, requireRole('candidate', 'super_admin'), async (req, res) => {
    try {
      await query(
        'update public.app_users set onboarding_completed = true where id = $1',
        [req.auth!.userId]
      );
      res.json({ ok: true, onboardingComplete: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update onboarding status', details: String(error) });
    }
  });

  router.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'prof-ai-api' });
  });

  return router;
}
