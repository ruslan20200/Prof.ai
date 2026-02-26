import { Button } from '@/components/ui/button';
import { AIThinking } from '@/components/LoadingSkeleton';
import { useStore } from '@/store/useStore';
import { jobs } from '@/data/jobs';
import { conductInterview, analyzeInterview } from '../lib/ai';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, BarChart3, ArrowLeft, Sparkles,
  TrendingUp, AlertTriangle, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useI18n } from '@/contexts/I18nContext';

const INTERVIEW_IMG = 'https://private-us-east-1.manuscdn.com/sessionFile/jEzBJwYrZx1oONmR73Dibg/sandbox/w9MJXfqlFpTQrySgI2073N-img-3_1772022775000_na1fn_aW50ZXJ2aWV3LWlsbHVzdHJhdGlvbg.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvakV6Qkp3WXJaeDFvT05tUjczRGliZy9zYW5kYm94L3c5TUpYZnFsRnBUUXJ5U2dJMjA3M04taW1nLTNfMTc3MjAyMjc3NTAwMF9uYTFmbl9hVzUwWlhKMmFXVjNMV2xzYkhWemRISmhkR2x2YmcucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=gcTbxLHRtPJji4QQqdmUKhHjPc4jzBYEfz2mmSg77VoazxFIUbyOExBQ9BR9~zVwVBb8wApmDzCs87pVOG-3tFpS3vxLw1PdxXjRRcqAtsCYRk7FVXRPjaw5KFJLApexX-Q~ztC241HHi6rS87Ah8FzTgiR-sD-PKI2xGBLDIWG5On1kLOFl5npLRmkRiv0wQYrSQBTq24G5sJJ9Ur3ncoIcKcL-tM9LuDaCnCC-kDZlZyBca~aWeQLB-O~orboMdigrGC83VI-WWVNwpP6dLvqKAMibWZ-VeIummub4t5XsrknVd84R7g-ceMzGbFy8~TRzuEmpwRH6c2Tirs~dog__';

export default function Interview() {
  const [, navigate] = useLocation();
  const { t, lang } = useI18n();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const jobIdParam = params.get('jobId');

  const {
    interviewMessages, addInterviewMessage, interviewActive, setInterviewActive,
    interviewAnalytics, setInterviewAnalytics, clearInterview, setInterviewJobId
  } = useStore();

  const [input, setInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(jobIdParam || '');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interviewMessages]);

  const startInterview = useCallback(async () => {
    if (!selectedJob) return;
    clearInterview();
    setInterviewJobId(selectedJob.id);
    setInterviewActive(true);
    setShowAnalytics(false);
    setAiLoading(true);

    try {
      const response = await conductInterview(
        selectedJob.title,
        selectedJob.requirements,
        [],
        true
      );
      addInterviewMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      });
    } catch {
      addInterviewMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: lang === 'kk'
          ? 'Сәлеметсіз бе! Сұхбатты бастайық. Өзіңіз және тәжірибеңіз туралы айтып беріңіз.'
          : 'Здравствуйте! Давайте начнём собеседование. Расскажите о себе и вашем опыте.',
        timestamp: Date.now(),
      });
    }
    setAiLoading(false);
  }, [selectedJob, clearInterview, setInterviewJobId, setInterviewActive, addInterviewMessage]);

  const sendMessage = async () => {
    if (!input.trim() || aiLoading || !selectedJob) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: Date.now(),
    };
    addInterviewMessage(userMsg);
    setInput('');
    setAiLoading(true);

    try {
      const allMessages = [...interviewMessages, userMsg];
      const response = await conductInterview(
        selectedJob.title,
        selectedJob.requirements,
        allMessages.map((m) => ({ role: m.role, content: m.content })),
        false
      );
      addInterviewMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      });
    } catch {
      addInterviewMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: lang === 'kk'
          ? 'Жақсы жауап! Жалғастырайық. Ең маңызды жобаңыз туралы айтып беріңіз.'
          : 'Хороший ответ! Давайте продолжим. Расскажите о вашем самом значимом проекте.',
        timestamp: Date.now(),
      });
    }
    setAiLoading(false);
  };

  const finishInterview = async () => {
    if (!selectedJob) return;
    setInterviewActive(false);
    setAnalyzing(true);

    try {
      const result = await analyzeInterview(interviewMessages, selectedJob.title);
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const analytics = JSON.parse(cleaned);
      setInterviewAnalytics(analytics);
    } catch {
      setInterviewAnalytics({
        confidenceScore: 72,
        anxietyLevel: 'средний',
        responseQuality: 68,
        strengths: ['Хорошая структура ответов', 'Релевантный опыт'],
        weaknesses: ['Можно добавить больше конкретных примеров'],
        overallFeedback: 'Хорошее собеседование! Рекомендуем подготовить больше конкретных примеров из опыта.',
        detailedAnalysis: lang === 'kk'
          ? 'Толық AI-талдау үшін GitHub Models токенін қосыңыз (VITE_GITHUB_TOKEN).'
          : 'Для полного AI-анализа добавьте токен GitHub Models (VITE_GITHUB_TOKEN).',
      });
    }
    setAnalyzing(false);
    setShowAnalytics(true);
  };
  if (!interviewActive && !showAnalytics) {
    return (
      <div className="min-h-screen pt-16">
        <div className="container py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
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
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">{t('interview.aiMock')}</span>
                </div>

                <h1 className="font-display text-3xl lg:text-5xl font-bold tracking-tight mb-4">
                  {t('interview.prepareTitle')}
                  <br />
                  <span className="text-primary">{t('interview.prepareAccent')}</span>
                </h1>

                <p className="text-muted-foreground text-lg mb-8 max-w-lg">
                  {t('interview.prepareSubtitle')}
                </p>

                <div className="space-y-3 mb-8">
                  <label className="text-sm font-medium">{t('interview.chooseJob')}</label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-white text-sm focus:border-primary outline-none"
                  >
                    <option value="">{t('interview.chooseJobPlaceholder')}</option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} — {j.company}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  size="lg"
                  disabled={!selectedJobId}
                  onClick={startInterview}
                  className="h-12 px-8 rounded-xl font-semibold gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {t('interview.startInterview')}
                </Button>
              </div>

              <div className="hidden lg:block">
                <img
                  src={INTERVIEW_IMG}
                  alt={t('interview.aiMock')}
                  className="w-full max-w-md mx-auto rounded-2xl"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
  if (showAnalytics && interviewAnalytics) {
    return (
      <div className="min-h-screen pt-16">
        <div className="container py-10 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-6">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">{t('interview.analyticsBadge')}</span>
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight mb-8">
              {t('interview.analyticsTitle')}
            </h1>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="rounded-2xl border border-border bg-white p-6 text-center">
                <div className="font-display text-4xl font-extrabold text-primary mb-1">
                  {interviewAnalytics.confidenceScore}%
                </div>
                <div className="text-xs text-muted-foreground font-medium">{t('interview.confidence')}</div>
              </div>
              <div className="rounded-2xl border border-border bg-white p-6 text-center">
                <div className="font-display text-4xl font-extrabold text-primary mb-1">
                  {interviewAnalytics.responseQuality}%
                </div>
                <div className="text-xs text-muted-foreground font-medium">{t('interview.answerQuality')}</div>
              </div>
              <div className="rounded-2xl border border-border bg-white p-6 text-center">
                <div className={`font-display text-2xl font-extrabold mb-1 ${
                  interviewAnalytics.anxietyLevel === 'низкий' ? 'text-green-600' :
                  interviewAnalytics.anxietyLevel === 'средний' ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {interviewAnalytics.anxietyLevel}
                </div>
                <div className="text-xs text-muted-foreground font-medium">{t('interview.anxietyLevel')}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 mb-6">
              <h3 className="font-display font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {t('interview.overallFeedback')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {interviewAnalytics.overallFeedback}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-2xl border border-green-100 bg-green-50/50 p-6">
                <h3 className="font-display font-bold mb-3 flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  {t('interview.strengths')}
                </h3>
                <ul className="space-y-2">
                  {interviewAnalytics.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                      <TrendingUp className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6">
                <h3 className="font-display font-bold mb-3 flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="w-4 h-4" />
                  {t('interview.growthZones')}
                </h3>
                <ul className="space-y-2">
                  {interviewAnalytics.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                      <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {interviewAnalytics.detailedAnalysis && (
              <div className="rounded-2xl border border-border bg-white p-6 mb-8">
                <h3 className="font-display font-bold mb-3">{t('interview.detailed')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {interviewAnalytics.detailedAnalysis}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { clearInterview(); setShowAnalytics(false); }}
                className="gap-2 bg-transparent"
              >
                <RefreshCw className="w-4 h-4" />
                {t('interview.retry')}
              </Button>
              <Button onClick={() => navigate('/dashboard')} className="gap-2">
                {t('interview.toDashboard')}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 flex flex-col">
      <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-30">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-bold font-display">{selectedJob?.title}</div>
              <div className="text-xs text-muted-foreground">{selectedJob?.company}</div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={finishInterview}
            className="gap-1 bg-transparent"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            {t('interview.finish')}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="container py-6 max-w-3xl space-y-4">
          <AnimatePresence>
            {interviewMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-muted/70 text-foreground rounded-bl-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {aiLoading && <AIThinking text={t('interview.interviewerThinking')} />}
          {analyzing && <AIThinking text={t('interview.analyzingInterview')} />}
          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="border-t border-border bg-white/80 backdrop-blur-md sticky bottom-0">
        <div className="container py-4 max-w-3xl">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={t('interview.answerPlaceholder')}
              className="flex-1 h-12 px-5 rounded-xl border border-border bg-white text-sm focus:border-primary outline-none transition-all"
              disabled={aiLoading}
              autoFocus
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || aiLoading}
              className="h-12 w-12 rounded-xl p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
