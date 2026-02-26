import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useStore } from '@/store/useStore';

type Role = 'seeker' | 'employer' | 'super_admin';

interface RoleGuardProps {
  allowedRoles: Role[];
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export default function RoleGuard({
  allowedRoles,
  children,
  redirectTo = '/auth',
  requireAuth = true,
}: RoleGuardProps) {
  const [, navigate] = useLocation();
  const { userRole, isAuthenticated, hasHydrated } = useStore();

  if (!hasHydrated) {
    return null;
  }

  const hasAllowedRole = !!userRole && allowedRoles.includes(userRole as Role);
  const isAllowed = hasAllowedRole && (!requireAuth || isAuthenticated);

  useEffect(() => {
    if (!isAllowed) {
      navigate(redirectTo);
    }
  }, [isAllowed, navigate, redirectTo]);

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
