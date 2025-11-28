import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Question, ProctoringLog, TestResult, RunResult, User } from '../types';
import { Language, Difficulty } from '../types';
import QuestionPanel from '../components/QuestionPanel';
import CodeEditor from '../components/CodeEditor';
import ProctoringView from '../components/ProctoringView';
import Timer from '../components/Timer';
import Button from '../components/Button';
import ExecutionPanel from '../components/ExecutionPanel';
import { TOTAL_TEST_TIME_SECONDS, SCORING } from '../constants';
import { executeJavaScript } from '../services/codeExecutionService';
import { saveTestSession } from '../services/dbService';


interface TestScreenProps {
  questions: Question[];
  onFinishTest: (results: TestResult[], logs: ProctoringLog[]) => void;
  user: User | null;
}

const TestScreen: React.FC<TestScreenProps> = ({ questions, onFinishTest, user }) => {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [violations, setViolations] = useState<{ [questionId: number]: ProctoringLog[] }>({});
  const [allLogs, setAllLogs] = useState<ProctoringLog[]>([]);
  
  const [code, setCode] = useState<{ [key: number]: { [lang in Language]?: string } }>({});
  const [language, setLanguage] = useState<Language>(Language.JavaScript);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState<RunResult[] | null>(null);
  
  // Track active question ID to prevent race conditions during async execution
  const activeQuestionIdRef = useRef<number | null>(null);
  
  const activeQuestion = questions[activeQuestionIndex];

  useEffect(() => {
    activeQuestionIdRef.current = activeQuestion?.id;
  }, [activeQuestion]);

  const addProctoringLog = useCallback((log: ProctoringLog) => {
    const questionId = questions[activeQuestionIndex]?.id;
    if (questionId) {
        setViolations(prev => ({
            ...prev,
            [questionId]: [...(prev[questionId] || []), log]
        }));
    }
    setAllLogs(prev => [...prev, log]);
  }, [activeQuestionIndex, questions]);

  const handleCodeChange = (newCode: string) => {
    const questionId = questions[activeQuestionIndex].id;
    setCode(prev => ({
        ...prev,
        [questionId]: {
            ...prev[questionId],
            [language]: newCode
        }
    }));
  };
  
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setRunResults(null);
  };
  
  useEffect(() => {
    if (questions.length > 0) {
        const initialCodeState: { [key: number]: { [lang in Language]?: string } } = {};
        const initialViolations: { [questionId: number]: ProctoringLog[] } = {};
        questions.forEach(q => {
            initialCodeState[q.id] = {
                [Language.JavaScript]: q.starterCode.javascript,
                [Language.Python]: q.starterCode.python,
                [Language.CPP]: q.starterCode.cpp
            }
            initialViolations[q.id] = [];
        });
        setCode(initialCodeState);
        setViolations(initialViolations);
    }
  }, [questions]);
  

  const handleRunCode = useCallback(async () => {
    if (!activeQuestion || language !== Language.JavaScript) return;
    
    // Capture the ID of the question we are running code for
    const runningForQuestionId = activeQuestion.id;
    
    setIsRunning(true);
    setRunResults(null);
    
    const currentUserCode = code[activeQuestion.id]?.[language] || '';
    const results = await executeJavaScript(currentUserCode, activeQuestion.examples.map(ex => ({ input: ex.input, output: ex.output })));
    
    // Only update state if the user is still looking at the same question
    if (activeQuestionIdRef.current === runningForQuestionId) {
        setRunResults(results.map((r, i) => ({
            id: i + 1,
            passed: r.passed,
            input: activeQuestion.examples[i].input,
            expected: activeQuestion.examples[i].output,
            actual: r.actual,
        })));
        setIsRunning(false);
    }
  }, [activeQuestion, language, code]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const results: TestResult[] = [];

    for(const q of questions) {
        const questionViolations = violations[q.id] || [];
        const totalTestCases = q.testCases.length;
        let passedTestCases = 0;

        // Only run test cases for JavaScript code
        const userCode = code[q.id]?.[Language.JavaScript];
        if (userCode) {
            const testResults = await executeJavaScript(userCode, q.testCases);
            passedTestCases = testResults.filter(r => r.passed).length;
        } 

        const maxScore = SCORING.points[q.difficulty as Difficulty];
        const baseScore = Math.round((passedTestCases / totalTestCases) * maxScore);
        
        const penalty = questionViolations.length * SCORING.violationPenalty;

        let finalScore = baseScore - penalty;

        if(questionViolations.length > SCORING.maxViolationsPerQuestion) {
            finalScore = 0;
        }
      
        results.push({
            questionId: q.id,
            questionTitle: q.title,
            difficulty: q.difficulty,
            passed: passedTestCases === totalTestCases,
            testCases: { total: totalTestCases, passed: passedTestCases },
            score: baseScore,
            violations: questionViolations.length,
            penalty,
            finalScore: Math.max(0, finalScore)
        });
    }

    // Save to Database
    if (user) {
        try {
            await saveTestSession(user, results, allLogs);
        } catch (e) {
            console.error("Failed to save results to DB", e);
            // We still proceed to show results screen
        }
    }
    
    onFinishTest(results, allLogs);
  }, [questions, onFinishTest, violations, allLogs, code, isSubmitting, user]);

  if (!activeQuestion) {
    return <div className="flex items-center justify-center h-full">Loading test...</div>;
  }
  
  const currentCode = code[activeQuestion.id]?.[language] || '';
  const isJsSelected = language === Language.JavaScript;

  return (
    <div className="flex-grow flex flex-col md:flex-row gap-4 h-[calc(100vh-200px)]">
      {/* Left Panel */}
      <div className="w-full md:w-[45%] flex flex-col gap-4">
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-700 flex justify-between items-center flex-shrink-0">
          <div className="flex gap-2">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => { setActiveQuestionIndex(index); setRunResults(null); }}
                className={`px-3 py-1 text-sm rounded ${activeQuestionIndex === index ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-700 hover:bg-zinc-600'}`}
              >
                Q{index + 1}
              </button>
            ))}
          </div>
          <Timer totalSeconds={TOTAL_TEST_TIME_SECONDS} onTimeUp={handleSubmit} />
        </div>
        <div className="flex-grow overflow-y-auto">
            <QuestionPanel question={activeQuestion} />
        </div>
        <div className="flex-shrink-0">
            <ProctoringView addLog={addProctoringLog} logs={violations[activeQuestion.id] || []} enabled={true} />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-[55%] flex flex-col bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden">
        <CodeEditor 
          code={currentCode}
          onCodeChange={handleCodeChange}
          language={language}
          onLanguageChange={handleLanguageChange}
        />
        <ExecutionPanel 
            results={runResults} 
            isRunning={isRunning} 
        />
        <div className="p-4 bg-black/50 border-t border-zinc-700 flex justify-end gap-4">
            <div className="relative" title={!isJsSelected ? "Code execution is only available for JavaScript in this demo." : ""}>
                <Button variant="secondary" onClick={handleRunCode} disabled={isRunning || !isJsSelected}>
                    {isRunning ? 'Running...' : 'Run Code'}
                </Button>
            </div>
             <div className="relative" title={!isJsSelected ? "Submission is only available for JavaScript in this demo." : ""}>
                <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting || !isJsSelected}>
                    {isSubmitting ? 'Submitting...' : 'Submit Test'}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TestScreen;
