import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';

const QUIZ_INTEREST_IMAGES = api.QUIZ_INTEREST_IMAGES;
const QUIZ_CRAFT_IMAGES = api.QUIZ_CRAFT_IMAGES;

const QUESTIONS = [
  {
    id: 'visitReason',
    title: 'Why are you visiting India?',
    subtitle: 'Share the reason behind your cultural journey.',
    type: 'text',
  },
  {
    id: 'interests',
    title: 'What interests you most?',
    subtitle: 'Select all the experiences you want to explore.',
    type: 'multi-image',
    options: [
      { id: 'Traditional Crafts', label: 'Traditional Crafts', caption: 'Handmade legacy', image: QUIZ_INTEREST_IMAGES['Traditional Crafts'] },
      { id: 'Handmade Products', label: 'Handmade Products', caption: 'Local treasures', image: QUIZ_INTEREST_IMAGES['Handmade Products'] },
      { id: 'Folk Music & Dance', label: 'Folk Music & Dance', caption: 'Rhythm of tradition', image: QUIZ_INTEREST_IMAGES['Folk Music & Dance'] },
      { id: 'Heritage Architecture', label: 'Heritage Architecture', caption: 'Timeless monuments', image: QUIZ_INTEREST_IMAGES['Heritage Architecture'] },
      { id: 'Food & Cuisine', label: 'Food & Cuisine', caption: 'Flavors of India', image: QUIZ_INTEREST_IMAGES['Food & Cuisine'] },
    ],
  },
  {
    id: 'crafts',
    title: 'What kind of crafts attract you?',
    subtitle: 'Pick the artisan traditions that draw your attention.',
    type: 'multi-image',
    options: [
      { id: 'Pottery', label: 'Pottery', image: QUIZ_CRAFT_IMAGES['Pottery'] },
      { id: 'Handloom Weaving', label: 'Handloom Weaving', image: QUIZ_CRAFT_IMAGES['Handloom Weaving'] },
      { id: 'Wood Carving', label: 'Wood Carving', image: QUIZ_CRAFT_IMAGES['Wood Carving'] },
      { id: 'Warli paintings', label: 'Warli paintings', image: QUIZ_CRAFT_IMAGES['Warli paintings'] },
      { id: 'Bamboo Craft', label: 'Bamboo Craft', image: QUIZ_CRAFT_IMAGES['Bamboo Craft'] },
      { id: 'Textile Art', label: 'Textile Art', image: QUIZ_CRAFT_IMAGES['Textile Art'] },
      { id: 'Painting', label: 'Painting', image: QUIZ_CRAFT_IMAGES['Painting'] },
      { id: 'Jewelry Making', label: 'Jewelry Making', image: QUIZ_CRAFT_IMAGES['Jewelry Making'] },
    ],
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
      { id: 'No Preference', label: 'No Preference' },
    ],
  },
  {
    id: 'workshopInterest',
    title: 'Would you like to participate in artisan workshops?',
    type: 'single-select',
    options: [
      { id: 'Yes, definitely', label: 'Yes, definitely' },
      { id: 'Maybe', label: 'Maybe' },
      { id: 'No', label: 'No' },
    ],
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
      { id: '₹10,000+', label: '₹10,000+' },
    ],
  },
];

const EMPTY_ANSWERS = {
  visitReason: '',
  interests: [],
  crafts: [],
  regions: [],
  workshopInterest: '',
  budget: '',
};

export default function ArtisticEchoesQuiz({ onNextScreen, userAvatar, onQuizSaved }) {
  const { setUserLocal } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [saving, setSaving] = useState(false);

  const question = QUESTIONS[currentQuestion];
  const progressPercent = Math.round(((currentQuestion + 1) / QUESTIONS.length) * 100);

  const handleTextChange = (value) => {
    setAnswers(prev => ({ ...prev, visitReason: value }));
  };

  const handleMultiToggle = (optionId) => {
    setAnswers(prev => {
      const field = question.id;
      const current = prev[field] || [];
      const next = current.includes(optionId)
        ? current.filter(i => i !== optionId)
        : [...current, optionId];
      return { ...prev, [field]: next };
    });
  };

  const handleSingleSelect = (optionId) => {
    setAnswers(prev => ({ ...prev, [question.id]: optionId }));
  };

  const goNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) setCurrentQuestion(v => v + 1);
  };
  const goBack = () => {
    if (currentQuestion > 0) setCurrentQuestion(v => v - 1);
  };

  const saveQuiz = async () => {
    setSaving(true);
    try {
      const res = await api.saveQuiz(answers);
      setUserLocal(res.profile);
      if (onQuizSaved) await onQuizSaved();
      onNextScreen('personalized-dashboard');
    } catch (err) {
      alert(err.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const isSelected = (optionId) => {
    if (question.type === 'multi-image' || question.type === 'multi-select') {
      return (answers[question.id] || []).includes(optionId);
    }
    if (question.type === 'single-select') {
      return answers[question.id] === optionId;
    }
    return false;
  };

  return (
    <div className="quiz-root">
      {/* Header */}
      <header className="quiz-header">
        <button onClick={() => onNextScreen('join-heritage')} className="icon-btn text-primary">
          <ArrowLeft size={20} />
        </button>
        <span className="quiz-header-title">Onboarding Quiz</span>
        <div className="quiz-avatar">
          <img alt="User" src={userAvatar} />
        </div>
      </header>

      <main className="quiz-main">
        <div className="quiz-progress-block">
          <div className="quiz-progress-top">
            <div>
              <span className="quiz-step-label">Question {currentQuestion + 1} of {QUESTIONS.length}</span>
              <h2 className="quiz-question-title">{question.title}</h2>
            </div>
            <div className="quiz-pct">{progressPercent}%</div>
          </div>
          {question.subtitle && (
            <p className="quiz-subtitle">{question.subtitle}</p>
          )}
          <div className="quiz-progress-bar">
            <div className="quiz-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <section>
          {question.type === 'text' && (
            <div>
              <label className="form-label">Your answer</label>
              <textarea
                value={answers.visitReason}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={5}
                placeholder="Tell us why you chose India for your cultural journey..."
                className="quiz-textarea"
              />
            </div>
          )}

          {(question.type === 'multi-image' || question.type === 'multi-select') && question.options && (
            <div className={`quiz-options-grid ${question.type === 'multi-image' ? 'quiz-options-grid--img' : 'quiz-options-grid--text'}`}>
              {question.options.map(option => {
                const sel = isSelected(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleMultiToggle(option.id)}
                    className={`quiz-option ${sel ? 'quiz-option--selected' : ''}`}
                  >
                    {option.image && (
                      <div className="quiz-option-img-wrap">
                        <img src={option.image} alt={option.label} className="quiz-option-img" />
                      </div>
                    )}
                    <div className="quiz-option-label-row">
                      <div>
                        <p className="quiz-option-label">{option.label}</p>
                        {option.caption && <p className="quiz-option-caption">{option.caption}</p>}
                      </div>
                      {sel && <CheckCircle size={20} className="text-primary" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {question.type === 'single-select' && question.options && (
            <div className="quiz-options-grid quiz-options-grid--single">
              {question.options.map(option => {
                const sel = isSelected(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSingleSelect(option.id)}
                    className={`quiz-option quiz-option--single ${sel ? 'quiz-option--selected' : ''}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Fixed bottom nav */}
      <div className="quiz-bottom-bar">
        <div className="quiz-bottom-inner">
          <div className="quiz-nav-btns">
            <button
              type="button"
              onClick={goBack}
              disabled={currentQuestion === 0}
              className={`quiz-nav-btn ${currentQuestion === 0 ? 'quiz-nav-btn--disabled' : ''}`}
            >
              Previous
            </button>
            <button type="button" onClick={goNext} className="quiz-nav-btn">
              Skip
            </button>
            {currentQuestion < QUESTIONS.length - 1 ? (
              <button type="button" onClick={goNext} className="quiz-nav-btn quiz-nav-btn--primary">
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={saveQuiz}
                disabled={saving}
                className="quiz-nav-btn quiz-nav-btn--primary"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
          <div className="quiz-selection-summary">
            <span>{(answers.interests || []).length} interests selected</span>
            <span className="dot" />
            <span>{(answers.crafts || []).length} crafts selected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
