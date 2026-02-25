import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  skills: string[];
  experience: string;
  education: string;
  interests: string[];
  currentRole: string;
  desiredRole: string;
  about: string;
  languages: string[];
  projects: string;
}

export interface OnboardingAnswer {
  question: string;
  answer: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface InterviewAnalytics {
  confidenceScore: number;
  anxietyLevel: string;
  responseQuality: number;
  strengths: string[];
  weaknesses: string[];
  overallFeedback: string;
  detailedAnalysis: string;
}

interface AppState {
  // User role
  userRole: 'seeker' | 'employer' | null;
  setUserRole: (role: 'seeker' | 'employer' | null) => void;

  // Onboarding
  onboardingStep: number;
  onboardingAnswers: OnboardingAnswer[];
  onboardingComplete: boolean;
  setOnboardingStep: (step: number) => void;
  addOnboardingAnswer: (answer: OnboardingAnswer) => void;
  setOnboardingComplete: (complete: boolean) => void;

  // User profile
  userProfile: UserProfile;
  setUserProfile: (profile: Partial<UserProfile>) => void;

  // Interview
  interviewMessages: ChatMessage[];
  interviewJobId: string | null;
  interviewActive: boolean;
  interviewAnalytics: InterviewAnalytics | null;
  addInterviewMessage: (message: ChatMessage) => void;
  setInterviewJobId: (id: string | null) => void;
  setInterviewActive: (active: boolean) => void;
  setInterviewAnalytics: (analytics: InterviewAnalytics | null) => void;
  clearInterview: () => void;

  // Employer
  employerJobs: Array<{
    id: string;
    title: string;
    description: string;
    requirements: string[];
    skills: string[];
    salary: string;
    location: string;
    type: string;
  }>;
  addEmployerJob: (job: AppState['employerJobs'][0]) => void;

  // Resume
  generatedResume: string | null;
  setGeneratedResume: (resume: string | null) => void;

  // Reset
  resetAll: () => void;
}

const initialProfile: UserProfile = {
  name: '',
  email: '',
  phone: '',
  city: '',
  skills: [],
  experience: '',
  education: '',
  interests: [],
  currentRole: '',
  desiredRole: '',
  about: '',
  languages: [],
  projects: '',
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      userRole: null,
      setUserRole: (role) => set({ userRole: role }),

      onboardingStep: 0,
      onboardingAnswers: [],
      onboardingComplete: false,
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      addOnboardingAnswer: (answer) =>
        set((state) => ({
          onboardingAnswers: [...state.onboardingAnswers, answer],
        })),
      setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),

      userProfile: initialProfile,
      setUserProfile: (profile) =>
        set((state) => ({
          userProfile: { ...state.userProfile, ...profile },
        })),

      interviewMessages: [],
      interviewJobId: null,
      interviewActive: false,
      interviewAnalytics: null,
      addInterviewMessage: (message) =>
        set((state) => ({
          interviewMessages: [...state.interviewMessages, message],
        })),
      setInterviewJobId: (id) => set({ interviewJobId: id }),
      setInterviewActive: (active) => set({ interviewActive: active }),
      setInterviewAnalytics: (analytics) => set({ interviewAnalytics: analytics }),
      clearInterview: () =>
        set({
          interviewMessages: [],
          interviewJobId: null,
          interviewActive: false,
          interviewAnalytics: null,
        }),

      employerJobs: [],
      addEmployerJob: (job) =>
        set((state) => ({
          employerJobs: [...state.employerJobs, job],
        })),

      generatedResume: null,
      setGeneratedResume: (resume) => set({ generatedResume: resume }),

      resetAll: () =>
        set({
          userRole: null,
          onboardingStep: 0,
          onboardingAnswers: [],
          onboardingComplete: false,
          userProfile: initialProfile,
          interviewMessages: [],
          interviewJobId: null,
          interviewActive: false,
          interviewAnalytics: null,
          employerJobs: [],
          generatedResume: null,
        }),
    }),
    {
      name: 'bilimmatch-storage',
    }
  )
);
