import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { api } from '../utils/api';
import { 
  Loader2, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  Home, 
  Award, 
  CheckCircle, 
  XCircle, 
  BrainCircuit,
  MessageSquare,
  Check,
  ChevronRight
} from 'lucide-react';

export default function GamePlay() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const { click, correct, incorrect, levelComplete, levelUp } = useSound();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [error, setError] = useState('');

  // Answer state
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [result, setResult] = useState(null); // { isCorrect, correctOption, explanation }

  // AI Tutor state
  const [hintOpen, setHintOpen] = useState(false);
  const [loadingHint, setLoadingHint] = useState(false);
  const [aiHintText, setAiHintText] = useState('');

  // Completion state
  const [levelFinished, setLevelFinished] = useState(false);
  const [completionResult, setCompletionResult] = useState(null); // { xpEarned, level, leveledUp }

  useEffect(() => {
    async function loadQuestions() {
      try {
        setError('');
        const data = await api.game.getQuestions(levelId);
        if (data.length === 0) {
          setError('This level does not have any questions seeded yet.');
        } else {
          setQuestions(data);
        }
      } catch (err) {
        console.error('Failed to load questions:', err);
        setError('Failed to load questions. Please check server.');
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [levelId]);

  const selectOption = (optIdx) => {
    if (isAnswered) return;
    click();
    setSelectedOption(optIdx);
  };

  const submitAnswer = async () => {
    if (selectedOption === null || isAnswered || submittingAnswer) return;

    setSubmittingAnswer(true);
    click();

    const currentQuestion = questions[currentIdx];

    try {
      const data = await api.game.checkAnswer(currentQuestion.id, selectedOption);
      setResult(data);
      setIsAnswered(true);

      if (data.isCorrect) {
        correct();
      } else {
        incorrect();
      }
    } catch (err) {
      console.error('Check answer error:', err);
      setError('Failed to check answer.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleNext = () => {
    click();
    // Reset answers
    setSelectedOption(null);
    setIsAnswered(false);
    setResult(null);
    setAiHintText('');
    setHintOpen(false);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finishLevel();
    }
  };

  const finishLevel = async () => {
    setLoading(true);
    try {
      const data = await api.game.completeLevel(levelId);
      setCompletionResult(data);
      setLevelFinished(true);

      // Play level complete music
      levelComplete();

      // Trigger level-up special sweep if they leveled up
      if (data.leveledUp) {
        setTimeout(() => {
          levelUp();
        }, 1200);
      }

      // Sync user profile state
      await refreshProfile();
    } catch (err) {
      console.error('Complete level error:', err);
      setError('Failed to record level completion.');
    } finally {
      setLoading(false);
    }
  };

  const askAITutor = async () => {
    if (loadingHint) return;
    click();
    setHintOpen(true);
    
    // Only load if not already loaded for this question
    if (aiHintText) return;

    setLoadingHint(true);
    const currentQuestion = questions[currentIdx];

    try {
      const data = await api.game.getAIHint(currentQuestion.id);
      setAiHintText(data.hint);
    } catch (err) {
      console.error('AI Hint error:', err);
      setAiHintText('EduBot was unable to connect right now. Check your internet or API settings!');
    } finally {
      setLoadingHint(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-bg p-6 min-h-[calc(100vh-73px)]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-purple mb-4" />
        <p className="text-gray-400 font-display font-medium">Entering Level Portal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-bg p-6 min-h-[calc(100vh-73px)]">
        <div className="max-w-md text-center space-y-4">
          <p className="text-red-300 font-semibold text-lg">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 mx-auto"
          >
            <Home className="w-5 h-5" />
            Return to Map
          </button>
        </div>
      </div>
    );
  }

  // Level Finished Overlay Screen
  if (levelFinished && completionResult) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-bg p-6 min-h-[calc(100vh-73px)] relative overflow-hidden">
        {/* Background glow sparks */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-brand-cyan/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-brand-purple/20 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-lg glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl text-center relative z-10 animate-sparkle">
          {/* Level completion icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-cyan flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-brand-purple/20 animate-bounce">
            <Award className="w-10 h-10" />
          </div>

          <h1 className="font-display font-black text-4xl text-white mb-2">Campaign Cleared!</h1>
          <p className="text-sm text-gray-400 max-w-sm mx-auto mb-8">
            You successfully completed all questions. You are growing stronger!
          </p>

          <div className="grid grid-cols-2 gap-4 bg-black/40 p-5 rounded-2xl border border-white/5 mb-8">
            <div className="text-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">XP Awarded</span>
              <span className="font-display font-extrabold text-3xl text-brand-cyan">+{completionResult.xpEarned} XP</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Realm Tier</span>
              <span className="font-display font-extrabold text-3xl text-brand-purple">Level {completionResult.level}</span>
            </div>
          </div>

          {/* Level Up Flash Banner */}
          {completionResult.leveledUp && (
            <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 flex items-center justify-center gap-2.5 animate-pulse">
              <Sparkles className="w-6 h-6 fill-yellow-500 text-yellow-500" />
              <span className="font-display font-black text-lg tracking-wide uppercase">Tier Level Up!</span>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => { click(); navigate('/social'); }}
              className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 font-bold rounded-2xl transition"
            >
              Leaderboard
            </button>
            <button
              onClick={() => { click(); navigate('/dashboarddashboard'); }}
              className="flex-1 py-3.5 bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 text-white font-bold rounded-2xl shadow-lg shadow-brand-purple/20 transition"
            >
              Continue Quest
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const progressPercent = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-dark-bg text-gray-200 min-h-[calc(100vh-73px)] relative overflow-hidden">
      
      {/* Left Column: Gameplay Board */}
      <div className="flex-1 p-6 md:p-12 flex flex-col justify-between max-w-4xl mx-auto w-full z-10">
        
        {/* Progress Header */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <button 
              onClick={askAITutor}
              className="px-3.5 py-1.5 rounded-xl bg-brand-purple/10 border border-brand-purple/20 text-brand-purple hover:bg-brand-purple/20 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-brand-purple/5"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              Ask AI Tutor
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Panel */}
        <div className={`flex-1 glass-panel rounded-3xl p-6 md:p-8 border border-white/5 flex flex-col justify-between transition-all duration-300 ${
          isAnswered 
            ? result?.isCorrect 
              ? 'border-game-success/30 shadow-lg shadow-game-success/5 animate-sparkle' 
              : 'border-game-error/30 shadow-lg shadow-game-error/5 animate-shake'
            : ''
        }`}>
          <div>
            {/* Question Text */}
            <div className="flex gap-3 items-start mb-6 md:mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-brand-cyan">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-xl md:text-2xl text-white leading-snug mt-1">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((opt, oIdx) => {
                const isSelected = selectedOption === oIdx;
                const isCorrectOption = result?.correctOption === oIdx;
                const isIncorrectSelection = isSelected && !result?.isCorrect;

                let btnStyles = 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/10';
                
                if (isAnswered) {
                  if (isCorrectOption) {
                    btnStyles = 'bg-game-success/20 border-game-success text-green-300 shadow-md shadow-game-success/10';
                  } else if (isIncorrectSelection) {
                    btnStyles = 'bg-game-error/20 border-game-error text-red-300 shadow-md shadow-game-error/10';
                  } else {
                    btnStyles = 'bg-white/2 border-white/2 text-gray-500 opacity-60 cursor-not-allowed';
                  }
                } else if (isSelected) {
                  btnStyles = 'bg-brand-purple/15 border-brand-purple text-brand-purple shadow-md shadow-brand-purple/10';
                }

                return (
                  <button
                    key={oIdx}
                    disabled={isAnswered}
                    onClick={() => selectOption(oIdx)}
                    className={`p-4 md:p-5 rounded-2xl border text-left font-semibold text-sm md:text-base transition-all duration-200 cursor-pointer flex items-center justify-between ${btnStyles}`}
                  >
                    <span>{opt}</span>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                      isAnswered
                        ? isCorrectOption
                          ? 'border-game-success text-game-success bg-game-success/10'
                          : isIncorrectSelection
                            ? 'border-game-error text-game-error bg-game-error/10'
                            : 'border-white/5 text-transparent'
                        : isSelected
                          ? 'border-brand-purple text-brand-purple'
                          : 'border-white/15'
                    }`}>
                      {isAnswered ? (
                        isCorrectOption ? <Check className="w-3.5 h-3.5" /> : isIncorrectSelection ? <span className="text-[10px] font-black font-display">X</span> : null
                      ) : isSelected ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-purple" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Correct/Incorrect Explanation Panel */}
          {isAnswered && result && (
            <div className={`mt-8 p-5 rounded-2xl border ${
              result.isCorrect 
                ? 'bg-game-success/5 border-game-success/15 text-green-300' 
                : 'bg-game-error/5 border-game-error/15 text-red-300'
            }`}>
              <div className="flex gap-2 items-center mb-2 font-bold font-display text-sm md:text-base uppercase tracking-wider">
                {result.isCorrect ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-game-success" />
                    <span>Fantastic Job!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-game-error" />
                    <span>Concept Check</span>
                  </>
                )}
              </div>
              <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-relaxed text-gray-300">
                <p className="font-semibold text-gray-100">Explanation</p>
                <p className="mt-1">{result.explanation}</p>
              </div>
              <div className="mt-3 rounded-2xl border border-brand-cyan/20 bg-brand-cyan/10 p-4 text-sm font-semibold text-brand-cyan">
                XP earned: +{currentQuestion?.xpReward || 10}
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="mt-8 flex justify-between items-center gap-4">
          <button 
            onClick={() => { click(); navigate('/'); }}
            className="px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-gray-200 font-bold rounded-2xl transition"
          >
            Flee Level
          </button>
          
          {!isAnswered ? (
            <button
              onClick={submitAnswer}
              disabled={selectedOption === null || submittingAnswer}
              className="px-8 py-3.5 bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 text-white font-bold rounded-2xl shadow-lg shadow-brand-purple/20 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Verify Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-8 py-3.5 bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-95 text-white font-bold rounded-2xl shadow-lg shadow-brand-purple/20 transition flex items-center gap-2 cursor-pointer animate-pulse"
            >
              {currentIdx + 1 < questions.length ? (
                <>
                  Next Question
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                'Finalize Campaign'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Right Column: AI Tutor Side Drawer */}
      {hintOpen && (
        <>
          {/* Backdrop overlay */}
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setHintOpen(false)}></div>
          
          <div className="fixed lg:static top-0 right-0 h-full w-[85vw] sm:w-[420px] lg:w-[400px] bg-dark-surface border-l border-white/5 lg:border-white/5 shadow-2xl p-6 z-50 flex flex-col justify-between animate-sparkle">
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-cyan flex items-center justify-center text-white shadow-md">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-white">EduBot AI Tutor</h3>
                </div>
                <button 
                  onClick={() => setHintOpen(false)}
                  className="text-gray-500 hover:text-gray-300 p-1.5 rounded-lg bg-white/5"
                >
                  ✖
                </button>
              </div>

              {/* Bot thinking / Response box */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-brand-cyan/15 flex items-center justify-center shrink-0 text-brand-cyan">
                    🤖
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-gray-200">EduBot Tutor</p>
                    <p className="text-gray-400">Powered by Groq API (Llama3)</p>
                  </div>
                </div>

                <div className="bg-black/35 rounded-2xl p-5 border border-white/5 min-h-[160px] flex items-center justify-center">
                  {loadingHint ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
                      <span className="text-xs text-gray-400 font-mono">EduBot is contemplating...</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-300 leading-relaxed font-medium">
                      {aiHintText}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Gamification tips */}
            <div className="bg-white/3 p-4 rounded-xl border border-white/5 text-[11px] text-gray-400 leading-relaxed space-y-1">
              <span className="font-bold text-brand-cyan">AI Tip:</span>
              <p>Ask EduBot hints when you feel stumped. It highlights concepts and clues without spoiling the answers directly. Use your power-ups wisely!</p>
            </div>

          </div>
        </>
      )}
      
    </div>
  );
}
