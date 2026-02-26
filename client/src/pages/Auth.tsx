import { useMemo, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { login, register } from '@/lib/authApi';
import { useStore } from '@/store/useStore';
import { useLocation, useSearch } from 'wouter';
import { toast } from 'sonner';
import { useI18n } from '@/contexts/I18nContext';

type Role = 'seeker' | 'employer';

function normalizeRole(raw: string | null): Role {
  return raw === 'employer' ? 'employer' : 'seeker';
}

export default function Auth() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const presetRole = normalizeRole(params.get('role'));
  const nextPath = params.get('next');
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [role, setRole] = useState<Role>(presetRole);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const { setAuthSession, userProfile, onboardingAnswers } = useStore();

  const handleSuccess = (token: string, user: Parameters<typeof setAuthSession>[1]) => {
    setAuthSession(token, user);

    if (nextPath && nextPath.startsWith('/')) {
      navigate(nextPath);
      return;
    }

    if (user.role === 'employer') {
      navigate('/employer/create-job');
      return;
    }

    if (user.onboardingComplete) {
      navigate('/dashboard');
      return;
    }

    navigate('/onboarding');
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        const response = await register({
          email: email.trim(),
          password,
          fullName: fullName.trim() || userProfile.name.trim(),
          age: age.trim() ? Number(age) : null,
          role,
          profileSnapshot: userProfile,
          onboardingAnswers,
        });
        handleSuccess(response.token, response.user);
        toast.success(t('auth.registrationDone'));
      } else {
        const response = await login({
          email: email.trim(),
          password,
        });
        handleSuccess(response.token, response.user);
        toast.success(t('auth.loginDone'));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('auth.authError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === 'register' ? t('common.register') : t('common.login')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'login' | 'register')} className="mb-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="register">{t('common.register')}</TabsTrigger>
              <TabsTrigger value="login">{t('common.login')}</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <Label>{t('auth.role')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={role === 'seeker' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => setRole('seeker')}
                    >
                      {t('auth.seeker')}
                    </Button>
                    <Button
                      type="button"
                      variant={role === 'employer' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => setRole('employer')}
                    >
                      {t('auth.employer')}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">{t('auth.age')}</Label>
                  <Input id="age" type="number" min={14} max={99} value={age} onChange={(e) => setAge(e.target.value)} required />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.emailLogin')}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('common.loading') : mode === 'register' ? t('auth.createAccount') : t('auth.signIn')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
