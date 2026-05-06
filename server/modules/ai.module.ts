import type express from 'express';
import { createJsonRoute } from '../http';
import { generateAssignmentFeedback, generateQuiz, summarizeDiscussion, summarizeText } from '../ai';

export const registerAiModule = (app: express.Express) => {
  app.post('/api/ai/study-copilot/summary', createJsonRoute((req, res) => {
    const { title, text } = req.body as { title?: string; text?: string };
    if (!title || !text) {
      res.status(400).json({ error: 'Title and text are required.' });
      return;
    }

    res.json(summarizeText(title, text));
  }));

  app.post('/api/ai/study-copilot/quiz', createJsonRoute((req, res) => {
    const { title, text, count } = req.body as { title?: string; text?: string; count?: number };
    if (!title || !text) {
      res.status(400).json({ error: 'Title and text are required.' });
      return;
    }

    res.json(generateQuiz(title, text, count ?? 3));
  }));

  app.post('/api/ai/assignment-feedback', createJsonRoute((req, res) => {
    const { submissionText, rubric } = req.body as { submissionText?: string; rubric?: string[] };
    if (!submissionText) {
      res.status(400).json({ error: 'Submission text is required.' });
      return;
    }

    res.json(generateAssignmentFeedback(submissionText, rubric ?? []));
  }));

  app.post('/api/ai/discussion-summary', createJsonRoute((req, res) => {
    const { title, messages } = req.body as { title?: string; messages?: string[] };
    if (!title || !messages?.length) {
      res.status(400).json({ error: 'Title and messages are required.' });
      return;
    }

    res.json(summarizeDiscussion(title, messages));
  }));
};
