export enum Difficulty {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
}

export interface TestCase {
  input: string;
  output: string;
  hidden?: boolean;
}

export interface Question {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  starterCode: {
    javascript: string;
    python: string;
    cpp: string;
  };
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  testCases: TestCase[];
}

export enum ProctoringEvent {
  NO_FACE = "No face detected",
  MULTIPLE_FACES = "Multiple faces detected",
  LOOKING_AWAY = "Eye movement out of bounds",
  SUSPICIOUS_NOISE = "Suspicious noise detected",
  USER_RETURNED = "User returned to view",
  FACE_SPOOF = "Potential face spoofing detected",
  MULTIPLE_VOICES = "Multiple voices detected",
  MOUTH_MOVEMENT = "Excessive mouth movement detected",
  CELL_PHONE_DETECTED = "Cell phone detected",
}

export interface ProctoringLog {
  timestamp: number;
  event: ProctoringEvent;
}

export interface RunResult {
    id: number;
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
}

export interface TestResult {
  questionId: number;
  questionTitle: string;
  difficulty: Difficulty;
  passed: boolean;
  testCases: {
      total: number;
      passed: number;
  };
  score: number;
  violations: number;
  penalty: number;
  finalScore: number;
}

export enum Language {
    JavaScript = "javascript",
    Python = "python",
    CPP = "cpp",
}

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
}
