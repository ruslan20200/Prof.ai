/* Career Canvas: AI Resume Generator */
import { Button } from '@/components/ui/button';
import { AIThinking } from '@/components/LoadingSkeleton';
import { useStore } from '@/store/useStore';
import { generateResume } from '@/lib/gemini';
import { motion } from 'framer-motion';
import { FileText, Download, RefreshCw, ArrowLeft, Sparkles } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import ReactMarkdown from 'react-markdown';

const RESUME_IMG = 'https://private-us-east-1.manuscdn.com/sessionFile/jEzBJwYrZx1oONmR73Dibg/sandbox/w9MJXfqlFpTQrySgI2073N-img-4_1772022767000_na1fn_cmVzdW1lLWlsbHVzdHJhdGlvbg.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvakV6Qkp3WXJaeDFvT05tUjczRGliZy9zYW5kYm94L3c5TUpYZnFsRnBUUXJ5U2dJMjA3M04taW1nLTRfMTc3MjAyMjc2NzAwMF9uYTFmbl9jbVZ6ZFcxbExXbHNiSFZ6ZEhKaGRHbHZiZy5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=VxPQ5V1tTN9yFAbe02y6Xp64jYuEnVCPFg1YZUqu0jx0-6DtQka3qaAwSG9vTU3cgzef9cKr3-1JKZTpg5cs2RoCERgqhJVtKHNelkmaaKqU5cBO2IMighWeUBFrMbgIpwg-pB42fDOY-jnOk5wrLRyYzAOrz41WAm04iQkmxYgCG0pu1pFPuA1bniYbxY8FjZQsPFdW9HK0a4sxrXTO-GM2Vw1~1kOrmtDxZsOAxv50pwXrCOu0EQ--nIxUNiQ6WL1vF~H3dtAjGyLM9PUSR4e1B0DY59qWsog26knbaMOEb623FK3e61QT-lfCCQgun7QNDU~UlgoFvtzqXhMpVA__';

export default function Resume() {
  const [, navigate] = useLocation();
  const { userProfile, onboardingAnswers, generatedResume, setGeneratedResume } = useStore();
  const [loading, setLoading] = useState(false);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    try {
      const resume = await generateResume(
        userProfile as unknown as Record<string, unknown>,
        onboardingAnswers as unknown as Array<Record<string, string>>
      );
      setGeneratedResume(resume);
    } catch {
      setGeneratedResume(`# Резюме — ${userProfile.name || 'Кандидат'}

## Контактная информация
- **Город:** ${userProfile.city || 'Не указан'}
- **Email:** ${userProfile.email || 'Не указан'}

## О себе
${userProfile.about || 'Мотивированный специалист, ищущий возможности для профессионального роста.'}

## Навыки
${userProfile.skills.map(s => `- ${s}`).join('\n') || '- Не указаны'}

## Опыт работы
- **Текущая роль:** ${userProfile.currentRole || 'Не указана'}
- **Стаж:** ${userProfile.experience || 'Не указан'}

## Образование
- ${userProfile.education || 'Не указано'}

## Языки
${userProfile.languages.map(l => `- ${l}`).join('\n') || '- Не указаны'}

## Желаемая позиция
${userProfile.desiredRole || 'Не указана'}
`);
    }
    setLoading(false);
  }, [userProfile, onboardingAnswers, setGeneratedResume]);

  const handleDownload = () => {
    if (!generatedResume) return;
    const blob = new Blob([generatedResume], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_${userProfile.name || 'bilimmatch'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Pre-generation screen
  if (!generatedResume && !loading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="container py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              variant="outline"
              size="sm"
              className="mb-6 gap-1 bg-transparent"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Назад
            </Button>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-4">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">AI Resume Generator</span>
                </div>

                <h1 className="font-display text-3xl lg:text-5xl font-bold tracking-tight mb-4">
                  Создайте
                  <br />
                  <span className="text-primary">резюме</span> за секунды
                </h1>

                <p className="text-muted-foreground text-lg mb-8 max-w-lg">
                  AI создаст профессиональное резюме на основе вашего профиля и ответов на вопросы онбординга.
                </p>

                {/* Profile preview */}
                <div className="rounded-xl border border-border bg-white p-5 mb-6">
                  <h3 className="text-sm font-bold mb-3">Данные для резюме:</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div><strong>Имя:</strong> {userProfile.name || '—'}</div>
                    <div><strong>Город:</strong> {userProfile.city || '—'}</div>
                    <div><strong>Опыт:</strong> {userProfile.experience || '—'}</div>
                    <div><strong>Навыки:</strong> {userProfile.skills.join(', ') || '—'}</div>
                    <div><strong>Образование:</strong> {userProfile.education || '—'}</div>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={handleGenerate}
                  className="h-12 px-8 rounded-xl font-semibold gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Сгенерировать резюме
                </Button>
              </div>

              <div className="hidden lg:block">
                <img
                  src={RESUME_IMG}
                  alt="Resume"
                  className="w-full max-w-md mx-auto rounded-2xl"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="container py-10 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">Ваше резюме</h1>
              <p className="text-sm text-muted-foreground">Сгенерировано AI на основе вашего профиля</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={loading}
                className="gap-1 bg-transparent"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                disabled={loading}
                className="gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Скачать .md
              </Button>
            </div>
          </div>

          {loading ? (
            <AIThinking text="AI генерирует ваше резюме..." />
          ) : (
            <div className="rounded-2xl border border-border bg-white p-8 lg:p-12 shadow-sm">
              <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:tracking-tight prose-h1:text-2xl prose-h2:text-lg prose-h2:border-b prose-h2:pb-2 prose-h2:border-border">
                <ReactMarkdown>{generatedResume || ''}</ReactMarkdown>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
