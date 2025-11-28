
import { MOCK_QUESTIONS } from '../constants';
import { Difficulty, type Question } from '../types';

export const getTestQuestions = (): Question[] => {
  const easyQuestions = MOCK_QUESTIONS.filter(q => q.difficulty === Difficulty.Easy);
  const mediumQuestions = MOCK_QUESTIONS.filter(q => q.difficulty === Difficulty.Medium);
  const hardQuestions = MOCK_QUESTIONS.filter(q => q.difficulty === Difficulty.Hard);

  const selectedQuestions: Question[] = [];

  if (easyQuestions.length > 0) {
    selectedQuestions.push(easyQuestions[Math.floor(Math.random() * easyQuestions.length)]);
  }
  if (mediumQuestions.length > 0) {
    selectedQuestions.push(mediumQuestions[Math.floor(Math.random() * mediumQuestions.length)]);
  }
  if (hardQuestions.length > 0) {
    selectedQuestions.push(hardQuestions[Math.floor(Math.random() * hardQuestions.length)]);
  }

  return selectedQuestions;
};
