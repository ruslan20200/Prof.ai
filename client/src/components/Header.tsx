/* Career Canvas: Swiss Design, Outfit display font, electric blue accent */
import { useStore } from '@/store/useStore';
import { Sparkles, Menu, X, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { userRole, onboardingComplete, resetAll } = useStore();
  const [location] = useLocation();

  const navItems = userRole === 'employer'
    ? [
        { href: '/employer/create-job', label: 'Создать вакансию' },
        { href: '/employer/candidates', label: 'Кандидаты' },
      ]
    : onboardingComplete
    ? [
        { href: '/dashboard', label: 'Дашборд' },
        { href: '/jobs', label: 'Вакансии' },
      ]
    : [];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-foreground tracking-tight">
            BilimMatch
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors no-underline ${
                location === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {userRole && (
            <button
              onClick={() => { resetAll(); window.location.href = '/'; }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Сброс
            </button>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-border">
          <nav className="container py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground no-underline py-2"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {userRole && (
              <button
                onClick={() => { resetAll(); window.location.href = '/'; setMenuOpen(false); }}
                className="text-sm text-destructive text-left py-2"
              >
                Сбросить данные
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
