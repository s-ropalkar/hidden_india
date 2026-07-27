/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { ScreenId } from '../types';
import * as api from '../api';
import { QUIZ_CRAFT_IMAGES, QUIZ_INTEREST_IMAGES } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

interface ArtisticEchoesQuizProps {
  onNextScreen: (next: ScreenId) => void;
  userAvatar: string;
  onQuizSaved?: () => void;
}

interface QuizOption {
  id: string;
  label: string;
  image?: string;
  caption?: string;
}

type QuestionType = 'text' | 'multi-image' | 'multi-select' | 'single-select';

interface QuizQuestion {
  id: keyof QuizAnswers;
  title: string;
  subtitle?: string;
  type: QuestionType;
  options?: QuizOption[];
}

interface QuizAnswers {
  visitReason: string;
  interests: string[];
  crafts: string[];
  regions: string[];
  workshopInterest: string;
  budget: string;
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'visitReason',
    title: 'Why are you visiting India?',
    subtitle: 'Share the reason behind your cultural journey.',
    type: 'text'
  },
  {
    id: 'interests',
    title: 'What interests you most?',
    subtitle: 'Select all the experiences you want to explore.',
    type: 'multi-image',
    options: [
      {
        id: 'Traditional Crafts',
        label: 'Traditional Crafts',
        caption: 'Handmade legacy',
        image: QUIZ_INTEREST_IMAGES['Traditional Crafts'],
      },
      {
        id: 'Handmade Products',
        label: 'Handmade Products',
        caption: 'Local treasures',
        image: QUIZ_INTEREST_IMAGES['Handmade Products'],
      },
      {
        id: 'Folk Music & Dance',
        label: 'Folk Music & Dance',
        caption: 'Rhythm of tradition',
        image: QUIZ_INTEREST_IMAGES['Folk Music & Dance'],
      },
      {
        id: 'Heritage Architecture',
        label: 'Heritage Architecture',
        caption: 'Timeless monuments',
        image: QUIZ_INTEREST_IMAGES['Heritage Architecture'],
      },
      {
        id: 'Food & Cuisine',
        label: 'Food & Cuisine',
        caption: 'Flavors of India',
        image: QUIZ_INTEREST_IMAGES['Food & Cuisine'],
      }
    ]
  },
  {
    id: 'crafts',
    title: 'What kind of crafts attract you?',
    subtitle: 'Pick the artisan traditions that draw your attention.',
    type: 'multi-image',
    options: [
      {
        id: 'Pottery',
        label: 'Pottery',
        image: QUIZ_CRAFT_IMAGES.Pottery,
      },
      {
        id: 'Handloom Weaving',
        label: 'Handloom Weaving',
        image: QUIZ_CRAFT_IMAGES['Handloom Weaving'],
      },
      {
        id: 'Wood Carving',
        label: 'Wood Carving',
        image: QUIZ_CRAFT_IMAGES['Wood Carving'],
      },
      {
        id: 'Warli paintings',
        label: 'Warli paintings',
        image: QUIZ_CRAFT_IMAGES['Warli paintings'],
      },
      {
        id: 'Bamboo Craft',
        label: 'Bamboo Craft',
        image: QUIZ_CRAFT_IMAGES['Bamboo Craft'],
      },
      {
        id: 'Textile Art',
        label: 'Textile Art',
        image: QUIZ_CRAFT_IMAGES['Textile Art'],
      },
      {
        id: 'Painting',
        label: 'Painting',
        image: QUIZ_CRAFT_IMAGES.Painting,
      },
      {
        id: 'Jewelry Making',
        label: 'Jewelry Making',
        image: QUIZ_CRAFT_IMAGES['Jewelry Making'],
      }
    ]
  },
  {
    id: 'regions',
    title: 'Which regions of India interest you most?',
    subtitle: 'Choose the areas you want to discover.',
    type: 'multi-select',
    options: [
      { id: 'North India', label: 'North India' },
      { id: 'South India', label: 'South India' },
      { id: 'East India', label: 'East India' },
      { id: 'West India', label: 'West India' },
      { id: 'North-East India', label: 'North-East India' },
      { id: 'No Preference', label: 'No Preference' }
    ]
  },
  {
    id: 'workshopInterest',
    title: 'Would you like to participate in artisan workshops?',
    type: 'single-select',
    options: [
      { id: 'Yes, definitely', label: 'Yes, definitely' },
      { id: 'Maybe', label: 'Maybe' },
      { id: 'No', label: 'No' }
    ]
  },
  {
    id: 'budget',
    title: 'What is your budget for cultural activities?',
    type: 'single-select',
    options: [
      { id: 'Under ₹500', label: 'Under ₹500' },
      { id: '₹500–₹2,000', label: '₹500–₹2,000' },
      { id: '₹2,000–₹5,000', label: '₹2,000–₹5,000' },
      { id: '₹5,000–₹10,000', label: '₹5,000–₹10,000' },
      { id: '₹10,000+', label: '₹10,000+' }
    ]
  }
];

const EMPTY_ANSWERS: QuizAnswers = {
  visitReason: '',
  interests: [],
  crafts: [],
  regions: [],
  workshopInterest: '',
  budget: ''
};

export default function ArtisticEchoesQuiz({ onNextScreen, userAvatar, onQuizSaved }: ArtisticEchoesQuizProps) {
  const { setUserLocal } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(EMPTY_ANSWERS);
  const [saving, setSaving] = useState(false);

  const question = QUESTIONS[currentQuestion];
  const progressPercent = Math.round(((currentQuestion + 1) / QUESTIONS.length) * 100);

  const handleTextChange = (value: string) => {
    setAnswers((prev) => ({ ...prev, visitReason: value }));
  };

  const handleMultiToggle = (optionId: string) => {
    setAnswers((prev) => {
      const field = question.id as 'interests' | 'crafts' | 'regions';
      const currentValues = prev[field] as string[];
      const nextValues = currentValues.includes(optionId)
        ? currentValues.filter((item) => item !== optionId)
        : [...currentValues, optionId];
      return { ...prev, [field]: nextValues } as QuizAnswers;
    });
  };

  const handleSingleSelect = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: optionId } as QuizAnswers));
  };

  const goNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion((value) => value + 1);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((value) => value - 1);
    }
  };

  const skipQuestion = () => {
    goNext();
  };

  const saveQuiz = async () => {
    setSaving(true);
    try {
      const res = await api.saveQuiz(answers);
      setUserLocal(res.profile);
      if (onQuizSaved) await onQuizSaved();
      onNextScreen('personalized-dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save quiz';
      alert(msg.includes('reach server') ? `${msg}\n\nStart backend: npm start` : msg);
    } finally {
      setSaving(false);
    }
  };

  const isSelected = (optionId: string) => {
    if (question.type === 'multi-image' || question.type === 'multi-select') {
      const field = question.id as 'interests' | 'crafts' | 'regions';
      return answers[field].includes(optionId);
    }

    if (question.type === 'single-select') {
      return answers[question.id] === optionId;
    }

    return false;
  };

  return (
    <div className="pattern-bg min-h-screen flex flex-col font-sans text-on-background relative select-none w-full pb-32">
      <header className="w-full sticky top-0 bg-surface/90 backdrop-blur-md border-b border-outline-variant/35 flex items-center justify-between px-4 h-16 z-40">
        <button
          onClick={() => onNextScreen('join-heritage')}
          className="flex items-center gap-2 active:scale-95 transition-transform cursor-pointer text-primary p-2"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="font-serif text-xl text-primary font-medium tracking-tight">Onboarding Quiz</span>
        <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/30">
          <img alt="User avatar" className="w-full h-full object-cover" src={userAvatar} />
        </div>
      </header>

      <main className="flex-1 px-4 pt-8 max-w-[560px] mx-auto w-full">
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4 gap-4">
            <div>
              <span className="font-sans font-bold text-xs uppercase tracking-widest text-tertiary">
                Question {currentQuestion + 1} of {QUESTIONS.length}
              </span>
              <h2 className="font-serif text-3xl font-semibold mt-1 tracking-tight text-on-surface">
                {question.title}
              </h2>
            </div>
            <div className="text-primary font-serif text-xl font-bold">{progressPercent}%</div>
          </div>

          {question.subtitle && (
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-6">
              {question.subtitle}
            </p>
          )}

          <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden mb-6">
            <div className="progress-bar-fill h-full bg-[#f6be39]" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <section className="animate-fade-in">
          {question.type === 'text' && (
            <div className="space-y-3">
              <label className="block text-sm font-sans font-semibold text-on-surface mb-2">Your answer</label>
              <textarea
                value={answers.visitReason}
                onChange={(event) => handleTextChange(event.target.value)}
                rows={5}
                placeholder="Tell us why you chose India for your cultural journey..."
                className="w-full rounded-3xl border border-outline-variant/30 bg-surface-container p-4 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition"
              />
            </div>
          )}

          {(question.type === 'multi-image' || question.type === 'multi-select') && question.options && (
            <div className={`grid gap-4 ${question.type === 'multi-image' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {question.options.map((option) => {
                const selected = isSelected(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleMultiToggle(option.id)}
                    className={`group text-left rounded-3xl border p-4 transition-all duration-300 ${selected ? 'border-primary bg-primary-container/15 shadow-sm shadow-primary/10' : 'border-outline-variant/30 bg-surface hover:border-primary hover:bg-surface-container-low'}`}
                  >
                    {option.image ? (
                      <div className="mb-4 overflow-hidden rounded-3xl bg-surface-container">
                        <img src={option.image} alt={option.label} className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-sans text-sm font-semibold text-on-surface">{option.label}</p>
                        {option.caption && <p className="mt-1 text-xs text-on-surface-variant">{option.caption}</p>}
                      </div>
                      {selected && <CheckCircle size={20} className="text-primary" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {question.type === 'single-select' && question.options && (
            <div className="grid gap-3 sm:grid-cols-2">
              {question.options.map((option) => {
                const selected = isSelected(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSingleSelect(option.id)}
                    className={`rounded-3xl border px-4 py-4 text-left text-sm font-semibold transition-all duration-300 ${selected ? 'border-primary bg-primary-container/15 text-on-surface' : 'border-outline-variant/30 bg-surface hover:border-primary hover:bg-surface-container-low'}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background via-background/90 to-transparent pt-12 pb-safe z-40">
        <div className="max-w-[560px] mx-auto grid gap-3">
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={currentQuestion === 0}
              className={`rounded-full py-3 text-sm font-bold uppercase transition ${currentQuestion === 0 ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed' : 'bg-surface text-on-surface hover:bg-surface-container-low'}`}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={skipQuestion}
              className="rounded-full py-3 bg-surface text-on-surface hover:bg-surface-container-low text-sm font-bold uppercase"
            >
              Skip
            </button>
            {currentQuestion < QUESTIONS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="rounded-full py-3 bg-primary text-on-primary hover:bg-[#a33d1f] text-sm font-bold uppercase"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={saveQuiz}
                disabled={saving}
                className="rounded-full py-3 bg-primary text-on-primary hover:bg-[#a33d1f] text-sm font-bold uppercase disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs font-sans tracking-widest text-on-surface-variant">
            <span>{answers.interests.length} interests selected</span>
            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
            <span>{answers.crafts.length} crafts selected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
