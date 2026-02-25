/* Career Canvas: Employer candidates search page */
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Search, Users, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function EmployerCandidates() {
  const [, navigate] = useLocation();

  // Mock candidates data for demo
  const candidates = [
    {
      id: '1',
      name: 'Айдар К.',
      skills: ['React', 'TypeScript', 'Node.js'],
      experience: '3-6 лет',
      city: 'Алматы',
      matchPercent: 92,
      education: 'Бакалавр',
    },
    {
      id: '2',
      name: 'Динара М.',
      skills: ['Python', 'Django', 'PostgreSQL'],
      experience: '1-3 года',
      city: 'Алматы',
      matchPercent: 85,
      education: 'Магистр',
    },
    {
      id: '3',
      name: 'Арман Т.',
      skills: ['Продажи', 'CRM', 'Английский язык'],
      experience: '3-6 лет',
      city: 'Алматы',
      matchPercent: 78,
      education: 'Бакалавр',
    },
    {
      id: '4',
      name: 'Камила С.',
      skills: ['Excel', 'Аналитика', 'Power BI'],
      experience: '1-3 года',
      city: 'Алматы',
      matchPercent: 71,
      education: 'Бакалавр',
    },
  ];

  return (
    <div className="min-h-screen pt-16">
      <div className="container py-10 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            variant="outline"
            size="sm"
            className="mb-6 gap-1 bg-transparent"
            onClick={() => navigate('/employer/create-job')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Назад
          </Button>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-4">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">AI Поиск кандидатов</span>
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">
            Кандидаты
          </h1>
          <p className="text-muted-foreground mb-8">
            AI подобрал лучших кандидатов для ваших вакансий
          </p>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск по навыкам, опыту..."
              className="w-full pl-11 pr-4 h-12 rounded-xl border border-border bg-white text-sm focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Candidates List */}
          <div className="space-y-4">
            {candidates.map((candidate, i) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-white p-6 hover:shadow-lg hover:border-primary/20 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-display font-bold text-primary text-sm">
                          {candidate.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-display font-bold">{candidate.name}</h3>
                        <div className="text-xs text-muted-foreground">
                          {candidate.city} • {candidate.experience} • {candidate.education}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {candidate.skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 rounded-full bg-primary/5 text-primary text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 bg-transparent"
                      onClick={() => toast.info('Функция приглашения будет доступна в полной версии')}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Пригласить на собеседование
                    </Button>
                  </div>

                  <div className="shrink-0 text-center">
                    <div className="font-display text-3xl font-extrabold text-primary">
                      {candidate.matchPercent}%
                    </div>
                    <div className="text-xs text-muted-foreground">совпадение</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
