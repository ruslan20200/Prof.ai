/* Career Canvas: Swiss Design, oversized typography, electric blue accent, clean white */
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Users, FileText, MessageSquare, Building2, Target } from 'lucide-react';
import { useLocation } from 'wouter';

const HERO_IMG = 'https://private-us-east-1.manuscdn.com/sessionFile/jEzBJwYrZx1oONmR73Dibg/sandbox/w9MJXfqlFpTQrySgI2073N-img-1_1772022784000_na1fn_aGVyby1iYW5uZXI.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvakV6Qkp3WXJaeDFvT05tUjczRGliZy9zYW5kYm94L3c5TUpYZnFsRnBUUXJ5U2dJMjA3M04taW1nLTFfMTc3MjAyMjc4NDAwMF9uYTFmbl9hR1Z5YnkxaVlXNXVaWEkucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=tA6aAO29oZWaEBrXHAp5XV5~Ktvmnil6CgRxnP9h3yUxFHXATFLUZ4-mbdMam9H-eWG3ybmE7QuuD87O-kT2jWP0mSnKBdbDLLUWdo6t4jQeGoMHS9gvUS7nr2iAJPWEPItlrSdf-GqAKam-~diFlDfXwgG~y0qzsyR-~Wjqs3vOYHnJERzmQnh~ItMGcuVk9nY0oXzhgBJzTZ5a0kH8wpxwEINA3dL3QG2dTiP8-weosXTjVYXrW2dvkPP9PLy8Ov6B4o8HnG3mjZ31ro6fINeJ-73jMjxGVFhxme26H4gPPIU4~bzdfMbFcJ3WQrsv2vWdI8KQPG9SJTLWW2hrnA__';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Онбординг',
    desc: 'Интерактивный диалог с ИИ — расскажите о себе, а мы найдём идеальную работу',
  },
  {
    icon: Target,
    title: 'Умный Матчинг',
    desc: 'Процент совпадения с каждой вакансией и рекомендации по развитию навыков',
  },
  {
    icon: FileText,
    title: 'Генератор Резюме',
    desc: 'Одним нажатием превратите ваш профиль в профессиональное резюме',
  },
  {
    icon: MessageSquare,
    title: 'Mock Interview',
    desc: 'Подготовьтесь к собеседованию с AI-интервьюером и получите детальный фидбек',
  },
];

export default function Home() {
  const [, navigate] = useLocation();
  const { setUserRole, onboardingComplete } = useStore();

  const handleSeeker = () => {
    setUserRole('seeker');
    if (onboardingComplete) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
  };

  const handleEmployer = () => {
    setUserRole('employer');
    navigate('/employer/create-job');
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Powered by Google Gemini 2.0</span>
              </div>

              <h1 className="font-display text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05] mb-6">
                Найди работу
                <br />
                <span className="text-primary">мечты</span> с AI
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                BilimMatch — AI-платформа, которая превращает поиск работы в увлекательный опыт. Пройдите интерактивный онбординг, получите подходящие вакансии и подготовьтесь к собеседованию.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={handleSeeker}
                  className="text-base px-8 h-12 rounded-xl font-semibold gap-2"
                >
                  <Users className="w-4 h-4" />
                  Я ищу работу
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleEmployer}
                  className="text-base px-8 h-12 rounded-xl font-semibold gap-2 bg-transparent"
                >
                  <Building2 className="w-4 h-4" />
                  Я работодатель
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <img
                src={HERO_IMG}
                alt="BilimMatch AI Career Platform"
                className="w-full rounded-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/50 py-20 lg:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl lg:text-5xl font-bold tracking-tight mb-4">
              Как это работает
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Четыре простых шага к вашей идеальной карьере
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="font-display text-5xl font-extrabold text-primary/10 mb-2">
                  0{i + 1}
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '20+', label: 'Вакансий в базе' },
              { value: 'AI', label: 'Gemini 2.0 Flash' },
              { value: '85%', label: 'Точность матчинга' },
              { value: '24/7', label: 'Mock Interview' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-display text-4xl lg:text-6xl font-extrabold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-foreground text-background py-20 lg:py-28">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl lg:text-5xl font-bold tracking-tight mb-4">
              Готовы начать?
            </h2>
            <p className="text-lg opacity-70 max-w-xl mx-auto mb-8">
              Пройдите AI-онбординг за 2 минуты и откройте для себя идеальные вакансии
            </p>
            <Button
              size="lg"
              onClick={handleSeeker}
              className="text-base px-10 h-12 rounded-xl font-semibold gap-2 bg-white text-foreground hover:bg-white/90"
            >
              Начать бесплатно
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-display text-sm font-bold">BilimMatch</span>
          </div>
          <p className="text-xs text-muted-foreground">
            BilimHack Almaty 2026 — AI Career Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
