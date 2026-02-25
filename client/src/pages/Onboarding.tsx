/* Career Canvas: Full-screen one-question-at-a-time onboarding, oversized typography */
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';

const ONBOARDING_IMG = 'https://private-us-east-1.manuscdn.com/sessionFile/jEzBJwYrZx1oONmR73Dibg/sandbox/w9MJXfqlFpTQrySgI2073N-img-2_1772022778000_na1fn_b25ib2FyZGluZy1pbGx1c3RyYXRpb24.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvakV6Qkp3WXJaeDFvT05tUjczRGliZy9zYW5kYm94L3c5TUpYZnFsRnBUUXJ5U2dJMjA3M04taW1nLTJfMTc3MjAyMjc3ODAwMF9uYTFmbl9iMjVpYjJGeVpHbHVaeTFwYkd4MWMzUnlZWFJwYjI0LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=RZCUB~G7h2q6rR3d9cqvdhmHd0u2RO8nOOhGcmm5mrVIXctm7OC~dA-85Vc2HZqZs1d95ffP~1khRtZpZ5BAL1bK0~ZvZQPf-iQULBtkG44WS7Pmm25R45Ls0oqhPTob3GZErEH1Awfe5YClMk5bB1g2w~dubwhlexH9LKzIheMWJvKd75V0DVETmh8i6HTElMgm3gi4ryUWsgdgcnMVtax7beKz090HFYqX~2qtLgvbtgEZFN0eSnkU~tRWjvkm40oGDO9LauWCpiqDzHaFcSzMVOu~mfOG7AgEhCFNVWzYXKxOkkbh1c1jrkfD5cFAjcF~JHarjPNyjS8zMQBfuA__';

interface Question {
  id: string;
  question: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'chips' | 'select';
  options?: string[];
  profileField: string;
  multi?: boolean;
}

const questions: Question[] = [
  {
    id: 'name',
    question: 'Как вас зовут?',
    placeholder: 'Введите ваше имя',
    type: 'text',
    profileField: 'name',
  },
  {
    id: 'city',
    question: 'В каком городе вы живёте?',
    placeholder: 'Например: Алматы',
    type: 'text',
    profileField: 'city',
  },
  {
    id: 'education',
    question: 'Какое у вас образование?',
    placeholder: '',
    type: 'select',
    options: ['Среднее', 'Среднее специальное (колледж)', 'Неоконченное высшее', 'Бакалавр', 'Магистр', 'PhD'],
    profileField: 'education',
  },
  {
    id: 'experience',
    question: 'Какой у вас опыт работы?',
    placeholder: '',
    type: 'select',
    options: ['Без опыта', 'До 1 года', '1-3 года', '3-6 лет', 'Более 6 лет'],
    profileField: 'experience',
  },
  {
    id: 'currentRole',
    question: 'Кем вы работаете сейчас?',
    placeholder: 'Например: студент, менеджер, разработчик...',
    type: 'text',
    profileField: 'currentRole',
  },
  {
    id: 'skills',
    question: 'Какие у вас навыки?',
    placeholder: '',
    type: 'chips',
    options: [
      'Python', 'JavaScript', 'React', 'Excel', 'SQL', 'Продажи',
      'Английский язык', 'Казахский язык', 'Коммуникация', 'Аналитика',
      'Дизайн', 'Маркетинг', 'Бухгалтерия', '1С', 'Менеджмент',
      'Логистика', 'HR', 'Финансы', 'AutoCAD', 'Photoshop',
    ],
    profileField: 'skills',
    multi: true,
  },
  {
    id: 'interests',
    question: 'Что вам интересно?',
    placeholder: '',
    type: 'chips',
    options: [
      'IT и разработка', 'Дизайн', 'Маркетинг', 'Финансы',
      'Продажи', 'HR', 'Образование', 'Медицина',
      'Строительство', 'Логистика', 'Производство', 'Сервис',
    ],
    profileField: 'interests',
    multi: true,
  },
  {
    id: 'desiredRole',
    question: 'Кем вы хотите работать?',
    placeholder: 'Опишите вашу идеальную работу...',
    type: 'textarea',
    profileField: 'desiredRole',
  },
  {
    id: 'languages',
    question: 'Какими языками вы владеете?',
    placeholder: '',
    type: 'chips',
    options: ['Казахский', 'Русский', 'Английский', 'Турецкий', 'Китайский', 'Немецкий', 'Французский', 'Корейский'],
    profileField: 'languages',
    multi: true,
  },
  {
    id: 'about',
    question: 'Расскажите немного о себе',
    placeholder: 'Ваши сильные стороны, достижения, хобби...',
    type: 'textarea',
    profileField: 'about',
  },
];

export default function Onboarding() {
  const [, navigate] = useLocation();
  const {
    onboardingStep,
    setOnboardingStep,
    addOnboardingAnswer,
    setOnboardingComplete,
    setUserProfile,
  } = useStore();

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  const current = questions[onboardingStep];
  const isLast = onboardingStep === questions.length - 1;
  const progress = ((onboardingStep + 1) / questions.length) * 100;

  const handleNext = useCallback(() => {
    const answer = current.type === 'chips' ? selectedChips.join(', ') : currentAnswer;

    if (!answer && current.type !== 'chips') return;
    if (current.type === 'chips' && selectedChips.length === 0) return;

    addOnboardingAnswer({ question: current.question, answer });

    if (current.type === 'chips') {
      setUserProfile({ [current.profileField]: selectedChips });
    } else {
      setUserProfile({ [current.profileField]: answer });
    }

    if (isLast) {
      setOnboardingComplete(true);
      navigate('/dashboard');
    } else {
      setOnboardingStep(onboardingStep + 1);
      setCurrentAnswer('');
      setSelectedChips([]);
    }
  }, [current, currentAnswer, selectedChips, isLast, onboardingStep, addOnboardingAnswer, setUserProfile, setOnboardingComplete, setOnboardingStep, navigate]);

  const handleBack = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1);
      setCurrentAnswer('');
      setSelectedChips([]);
    }
  };

  const toggleChip = (chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const canProceed =
    current.type === 'chips' ? selectedChips.length > 0 : currentAnswer.trim().length > 0;

  return (
    <div className="min-h-screen pt-16 flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex">
        {/* Left side - Question */}
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-20 py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={onboardingStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Шаг {onboardingStep + 1} из {questions.length}
                </span>
              </div>

              <h1 className="font-display text-3xl lg:text-5xl font-bold tracking-tight mb-8 leading-tight">
                {current.question}
              </h1>

              {/* Input based on type */}
              {current.type === 'text' && (
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && canProceed && handleNext()}
                  placeholder={current.placeholder}
                  className="w-full text-xl lg:text-2xl border-b-2 border-border focus:border-primary bg-transparent py-3 outline-none transition-colors font-display"
                  autoFocus
                />
              )}

              {current.type === 'textarea' && (
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder={current.placeholder}
                  className="w-full text-lg border-2 border-border focus:border-primary bg-transparent rounded-xl p-4 outline-none transition-colors resize-none h-32"
                  autoFocus
                />
              )}

              {current.type === 'select' && (
                <div className="space-y-3">
                  {current.options?.map((option) => (
                    <button
                      key={option}
                      onClick={() => setCurrentAnswer(option)}
                      className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all text-base font-medium ${
                        currentAnswer === option
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/30 text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {option}
                        {currentAnswer === option && <Check className="w-5 h-5" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {current.type === 'chips' && (
                <div className="flex flex-wrap gap-2.5">
                  {current.options?.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => toggleChip(chip)}
                      className={`px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                        selectedChips.includes(chip)
                          ? 'border-primary bg-primary text-white'
                          : 'border-border hover:border-primary/30 text-foreground'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center gap-3 mt-10">
                {onboardingStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="h-12 px-6 rounded-xl gap-2 bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Назад
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="h-12 px-8 rounded-xl gap-2 font-semibold"
                >
                  {isLast ? 'Завершить' : 'Далее'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Нажмите Enter для продолжения
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right side - Illustration (desktop only) */}
        <div className="hidden lg:flex w-[40%] items-center justify-center p-12 bg-secondary/30">
          <motion.img
            src={ONBOARDING_IMG}
            alt="Onboarding"
            className="max-w-md w-full rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
