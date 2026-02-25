/* Career Canvas: Dashboard with oversized match scores, clean cards */
import { Button } from '@/components/ui/button';
import { AIThinking } from '@/components/LoadingSkeleton';
import { useStore } from '@/store/useStore';
import { jobs } from '@/data/jobs';
import { matchJobsWithProfile } from '@/lib/gemini';
import { motion } from 'framer-motion';
import {
  Sparkles, FileText, MessageSquare, MapPin, Briefcase, TrendingUp,
  ArrowRight, Building2, ChevronRight
} from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation, Link } from 'wouter';

interface MatchResult {
  jobId: string;
  matchPercent: number;
  explanation: string;
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { userProfile, onboardingComplete, onboardingAnswers } = useStore();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!onboardingComplete) {
      navigate('/onboarding');
      return;
    }
  }, [onboardingComplete, navigate]);

  const runMatching = useCallback(async () => {
    setLoading(true);
    try {
      const results = await matchJobsWithProfile(
        userProfile as unknown as Record<string, unknown>,
        jobs as unknown as Array<Record<string, unknown>>
      );
      setMatches(results.sort((a, b) => b.matchPercent - a.matchPercent));
    } catch {
      // Fallback matching
      const fallback = jobs.map((j) => {
        const skillMatch = j.skills.filter((s) =>
          userProfile.skills.some((us) => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
        ).length;
        const percent = Math.min(95, Math.floor((skillMatch / Math.max(j.skills.length, 1)) * 80 + Math.random() * 20));
        return { jobId: j.id, matchPercent: percent, explanation: 'Совпадение на основе ваших навыков.' };
      });
      setMatches(fallback.sort((a, b) => b.matchPercent - a.matchPercent));
    }
    setLoading(false);
  }, [userProfile]);

  useEffect(() => {
    if (onboardingComplete) {
      runMatching();
    }
  }, [onboardingComplete, runMatching]);

  const topMatches = useMemo(() => {
    return matches.slice(0, 6).map((m) => ({
      ...m,
      job: jobs.find((j) => j.id === m.jobId),
    })).filter((m) => m.job);
  }, [matches]);

  const getMatchColor = (percent: number) => {
    if (percent >= 75) return 'text-green-600';
    if (percent >= 50) return 'text-amber-500';
    return 'text-muted-foreground';
  };

  const getMatchBg = (percent: number) => {
    if (percent >= 75) return 'bg-green-50 border-green-100';
    if (percent >= 50) return 'bg-amber-50 border-amber-100';
    return 'bg-muted/50 border-border';
  };

  if (!onboardingComplete) return null;

  return (
    <div className="min-h-screen pt-16">
      <div className="container py-10">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight mb-2">
            Привет, {userProfile.name || 'Кандидат'} 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Вот ваши лучшие совпадения с вакансиями
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <Link href="/jobs" className="no-underline">
            <div className="p-5 rounded-xl border border-border hover:border-primary/20 hover:shadow-md transition-all bg-white group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <span className="font-display font-bold text-foreground">Все вакансии</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {jobs.length} вакансий с AI-матчингом
              </p>
            </div>
          </Link>

          <Link href="/resume" className="no-underline">
            <div className="p-5 rounded-xl border border-border hover:border-primary/20 hover:shadow-md transition-all bg-white group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <span className="font-display font-bold text-foreground">Моё резюме</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Сгенерировать AI-резюме
              </p>
            </div>
          </Link>

          <Link href="/interview" className="no-underline">
            <div className="p-5 rounded-xl border border-border hover:border-primary/20 hover:shadow-md transition-all bg-white group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <span className="font-display font-bold text-foreground">Mock Interview</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Подготовка к собеседованию
              </p>
            </div>
          </Link>
        </div>

        {/* Profile Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 p-6 rounded-2xl border border-border bg-white"
        >
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Ваш профиль
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Город</div>
              <div className="text-sm font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {userProfile.city || 'Не указан'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Опыт</div>
              <div className="text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                {userProfile.experience || 'Не указан'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Образование</div>
              <div className="text-sm font-medium">{userProfile.education || 'Не указано'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Желаемая роль</div>
              <div className="text-sm font-medium">{userProfile.desiredRole || 'Не указана'}</div>
            </div>
          </div>
          {userProfile.skills.length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-muted-foreground mb-2">Навыки</div>
              <div className="flex flex-wrap gap-1.5">
                {userProfile.skills.map((skill) => (
                  <span key={skill} className="px-2.5 py-1 rounded-full bg-primary/5 text-primary text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Top Matches */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Лучшие совпадения</h2>
          <Link href="/jobs" className="text-sm text-primary font-medium flex items-center gap-1 no-underline">
            Все вакансии <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <AIThinking text="AI анализирует ваш профиль и подбирает вакансии..." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topMatches.map((match, i) => (
              <motion.div
                key={match.jobId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-white p-6 hover:shadow-lg hover:border-primary/20 transition-all group"
              >
                {/* Match Score */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 border ${getMatchBg(match.matchPercent)}`}>
                  <span className={getMatchColor(match.matchPercent)}>
                    {match.matchPercent}% совпадение
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold mb-1 group-hover:text-primary transition-colors">
                  {match.job!.title}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                  <Building2 className="w-3.5 h-3.5" />
                  {match.job!.company}
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {match.job!.location}
                  </span>
                </div>

                <div className="text-sm font-semibold text-foreground mb-3">
                  {match.job!.salary}
                </div>

                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                  {match.explanation}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {match.job!.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                      {skill}
                    </span>
                  ))}
                  {match.job!.skills.length > 3 && (
                    <span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                      +{match.job!.skills.length - 3}
                    </span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-lg gap-1 bg-transparent"
                  onClick={() => navigate(`/interview?jobId=${match.jobId}`)}
                >
                  Mock Interview
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
