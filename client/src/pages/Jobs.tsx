/* Career Canvas: Job listings with filters and match scores */
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { jobs, jobCategories } from '@/data/jobs';
import { matchJobsWithProfile } from '@/lib/gemini';
import { motion } from 'framer-motion';
import {
  Search, MapPin, Building2, Briefcase, Clock, ArrowRight, Filter, X
} from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation } from 'wouter';

interface MatchResult {
  jobId: string;
  matchPercent: number;
  explanation: string;
}

export default function Jobs() {
  const [, navigate] = useLocation();
  const { userProfile, onboardingComplete } = useStore();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [showFilters, setShowFilters] = useState(false);

  const runMatching = useCallback(async () => {
    if (!onboardingComplete) return;
    try {
      const results = await matchJobsWithProfile(
        userProfile as unknown as Record<string, unknown>,
        jobs as unknown as Array<Record<string, unknown>>
      );
      setMatches(results);
    } catch {
      const fallback = jobs.map((j) => {
        const skillMatch = j.skills.filter((s) =>
          userProfile.skills.some((us) => us.toLowerCase().includes(s.toLowerCase()))
        ).length;
        const percent = Math.min(95, Math.floor((skillMatch / Math.max(j.skills.length, 1)) * 80 + Math.random() * 20));
        return { jobId: j.id, matchPercent: percent, explanation: '' };
      });
      setMatches(fallback);
    }
  }, [userProfile, onboardingComplete]);

  useEffect(() => {
    runMatching();
  }, [runMatching]);

  const filteredJobs = useMemo(() => {
    let result = jobs;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'Все') {
      result = result.filter((j) => j.category === selectedCategory);
    }

    // Sort by match if available
    if (matches.length > 0) {
      result = [...result].sort((a, b) => {
        const matchA = matches.find((m) => m.jobId === a.id)?.matchPercent || 0;
        const matchB = matches.find((m) => m.jobId === b.id)?.matchPercent || 0;
        return matchB - matchA;
      });
    }

    return result;
  }, [searchQuery, selectedCategory, matches]);

  const getMatch = (jobId: string) => matches.find((m) => m.jobId === jobId);

  const getMatchColor = (percent: number) => {
    if (percent >= 75) return 'text-green-600 bg-green-50 border-green-100';
    if (percent >= 50) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-muted-foreground bg-muted/50 border-border';
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight mb-2">
            Вакансии
          </h1>
          <p className="text-muted-foreground">
            {filteredJobs.length} вакансий найдено
            {onboardingComplete && ' • Отсортировано по совпадению с вашим профилем'}
          </p>
        </motion.div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию, компании или навыкам..."
                className="w-full pl-11 pr-4 h-12 rounded-xl border border-border bg-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <Button
              variant="outline"
              className="h-12 px-4 rounded-xl gap-2 bg-transparent lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Category filters */}
          <div className={`flex flex-wrap gap-2 ${showFilters ? '' : 'hidden lg:flex'}`}>
            {jobCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border text-foreground hover:border-primary/30'
                }`}
              >
                {cat}
              </button>
            ))}
            {selectedCategory !== 'Все' && (
              <button
                onClick={() => setSelectedCategory('Все')}
                className="px-3 py-2 rounded-full text-sm text-destructive hover:bg-destructive/5 transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Сбросить
              </button>
            )}
          </div>
        </div>

        {/* Job List */}
        <div className="space-y-4">
          {filteredJobs.map((job, i) => {
            const match = getMatch(job.id);
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl border border-border bg-white p-6 hover:shadow-lg hover:border-primary/20 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-display text-lg font-bold mb-1">{job.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="w-3.5 h-3.5" />
                          {job.company}
                        </div>
                      </div>
                      {match && onboardingComplete && (
                        <div className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-bold border ${getMatchColor(match.matchPercent)}`}>
                          {match.matchPercent}%
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.experience}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {job.format}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            onboardingComplete && userProfile.skills.some(
                              (us) => us.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(us.toLowerCase())
                            )
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-display text-base font-bold text-foreground">
                        {job.salary}
                      </span>
                      <Button
                        size="sm"
                        className="rounded-lg gap-1"
                        onClick={() => navigate(`/interview?jobId=${job.id}`)}
                      >
                        Mock Interview
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filteredJobs.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">Вакансии не найдены</p>
              <p className="text-sm text-muted-foreground mt-1">Попробуйте изменить фильтры</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
