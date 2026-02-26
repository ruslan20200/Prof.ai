import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { Building2, Plus, X, ArrowLeft, Sparkles, Check } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { useI18n } from '@/contexts/I18nContext';

export default function EmployerCreateJob() {
  const [, navigate] = useLocation();
  const { t } = useI18n();
  const { addEmployerJob, employerJobs } = useStore();

  const [form, setForm] = useState({
    title: '',
    description: '',
    salary: '',
    location: 'Алматы',
    type: 'Полная занятость',
    requirements: [''],
    skills: [''],
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addRequirement = () => {
    setForm((prev) => ({ ...prev, requirements: [...prev.requirements, ''] }));
  };

  const removeRequirement = (index: number) => {
    setForm((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      requirements: prev.requirements.map((r, i) => (i === index ? value : r)),
    }));
  };

  const addSkill = () => {
    setForm((prev) => ({ ...prev, skills: [...prev.skills, ''] }));
  };

  const removeSkill = (index: number) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.map((s, i) => (i === index ? value : s)),
    }));
  };

  const handleSubmit = () => {
    if (!form.title || !form.description) {
      toast.error(t('employerCreate.fillTitleDesc'));
      return;
    }

    addEmployerJob({
      id: Date.now().toString(),
      title: form.title,
      description: form.description,
      salary: form.salary,
      location: form.location,
      type: form.type,
      requirements: form.requirements.filter(Boolean),
      skills: form.skills.filter(Boolean),
    });

    toast.success(t('employerCreate.created'));
    setForm({
      title: '',
      description: '',
      salary: '',
      location: 'Алматы',
      type: 'Полная занятость',
      requirements: [''],
      skills: [''],
    });
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container py-10 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            variant="outline"
            size="sm"
            className="mb-6 gap-1 bg-transparent"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('common.home')}
          </Button>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-4">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">{t('employerCreate.badge')}</span>
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">
            {t('employerCreate.title')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t('employerCreate.subtitle')}
          </p>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('employerCreate.titleLabel')}</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder={t('employerCreate.titlePlaceholder')}
                className="w-full h-12 px-4 rounded-xl border border-border bg-white text-sm focus:border-primary outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('employerCreate.descriptionLabel')}</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder={t('employerCreate.descriptionPlaceholder')}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:border-primary outline-none transition-all resize-none h-32"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t('employerCreate.salary')}</label>
                <input
                  type="text"
                  value={form.salary}
                  onChange={(e) => updateField('salary', e.target.value)}
                  placeholder={t('employerCreate.salaryPlaceholder')}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-white text-sm focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('employerCreate.city')}</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-white text-sm focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('employerCreate.employmentType')}</label>
              <select
                value={form.type}
                onChange={(e) => updateField('type', e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-border bg-white text-sm focus:border-primary outline-none"
              >
                <option>{t('employerCreate.full')}</option>
                <option>{t('employerCreate.part')}</option>
                <option>{t('employerCreate.internship')}</option>
                <option>{t('employerCreate.project')}</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('employerCreate.requirements')}</label>
              <div className="space-y-2">
                {form.requirements.map((req, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => updateRequirement(i, e.target.value)}
                      placeholder={t('employerCreate.reqPlaceholder')}
                      className="flex-1 h-10 px-4 rounded-lg border border-border bg-white text-sm focus:border-primary outline-none transition-all"
                    />
                    {form.requirements.length > 1 && (
                      <button
                        onClick={() => removeRequirement(i)}
                        className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-destructive/5 hover:border-destructive/20 transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addRequirement}
                  className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('employerCreate.addRequirement')}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('employerCreate.skills')}</label>
              <div className="space-y-2">
                {form.skills.map((skill, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateSkill(i, e.target.value)}
                      placeholder={t('employerCreate.skillPlaceholder')}
                      className="flex-1 h-10 px-4 rounded-lg border border-border bg-white text-sm focus:border-primary outline-none transition-all"
                    />
                    {form.skills.length > 1 && (
                      <button
                        onClick={() => removeSkill(i)}
                        className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-destructive/5 hover:border-destructive/20 transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addSkill}
                  className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('employerCreate.addSkill')}
                </button>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleSubmit}
              className="w-full h-12 rounded-xl font-semibold gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {t('employerCreate.publish')}
            </Button>
          </div>

          {employerJobs.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-xl font-bold mb-4">{t('employerCreate.yourJobs')}</h2>
              <div className="space-y-3">
                {employerJobs.map((job) => (
                  <div key={job.id} className="rounded-xl border border-border bg-white p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display font-bold mb-1">{job.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.skills.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-full bg-primary/5 text-primary text-xs font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <Check className="w-3.5 h-3.5" />
                        {t('employerCreate.active')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
