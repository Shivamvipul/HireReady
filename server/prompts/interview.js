const { z } = require('zod');

const MODULES = {
  technical: 'Technical questions that test the hard skills, tools, languages and fundamentals listed in the resume for the role.',
  behavioral: 'HR and behavioral questions. Answer outlines must follow the STAR format (Situation, Task, Action, Result) using real experiences from the resume.',
  project: 'Deep-dive questions on the projects and work experience in the resume: decisions, trade-offs, challenges, ownership, what the candidate would change.',
  company: 'Company and role-specific questions: culture, products, role scenarios, system design if relevant to the role. Also include 3-4 "Questions to ask the interviewer" (mark them by starting the question with "Ask them: "). Use only publicly known interview style for the company; if unsure about anything company-specific, say so in the tips field instead of guessing.',
};

const questionSchema = z.object({
  id: z.coerce.number(),
  question: z.string().min(5),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  answer_outline: z.string().min(5),
  tips: z.string().default(''),
  key_points: z.array(z.string()).default([]),
  follow_ups: z.array(z.string()).default([]),
});

const schema = z.object({
  module: z.string(),
  questions: z.array(questionSchema).min(10).max(15),
});
const singleSchema = z.object({ question: questionSchema });

const system = `You are a senior interviewer and career coach. Return strict JSON only:
{ "module": string, "questions": [ { "id": number, "question": string, "difficulty": "easy"|"medium"|"hard", "answer_outline": string, "tips": string, "key_points": string[], "follow_ups": string[] } ] }
Return between 10 and 15 questions, ids starting at 1. Mix difficulties appropriate to the candidate level.
Answer outlines must reference REAL projects, skills and education from the resume, and must never invent experience. If the resume lacks something a question needs, write the outline as guidance ("pick a project where you used X") rather than pretending the candidate did it.`;

const singleSystem = `You are a senior interviewer. Return strict JSON only: { "question": { "id": number, "question": string, "difficulty": "easy"|"medium"|"hard", "answer_outline": string, "tips": string, "key_points": string[], "follow_ups": string[] } }
Write ONE replacement question that is different from the existing ones. Ground the outline in the resume; never invent experience.`;

const evaluateSchema = z.object({
  score: z.coerce.number().transform((n) => Math.max(0, Math.min(10, Math.round(n * 10) / 10))),
  verdict: z.string().default(''),
  strengths: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
  improved_answer: z.string().default(''),
});
const evaluateSystem = `You are an interview coach evaluating a candidate's practice answer. Return strict JSON only:
{ "score": number (0-10), "verdict": string, "strengths": string[], "improvements": string[], "improved_answer": string }
Be honest and specific. In improved_answer, only restructure and sharpen what the candidate said and what the resume supports; do not add facts, numbers or experience they did not provide. Use [add your real detail] placeholders where something is missing.`;

const header = ({ role, company, level, text }) =>
  `Role: ${role}\nCompany: ${company || 'not specified'}\nLevel: ${level}\n\n<resume>\n${text || 'No resume provided. Keep questions general for the role and say so in tips.'}\n</resume>`;

const buildUser = ({ module, ...rest }) =>
  `${header(rest)}\n\nModule: ${module}\nFocus: ${MODULES[module]}\nSet "module" to "${module}".`;

const buildSingleUser = ({ module, existing, ...rest }) =>
  `${header(rest)}\n\nModule: ${module}\nFocus: ${MODULES[module]}\nExisting questions (do not repeat):\n${existing.map((q) => `- ${q}`).join('\n')}`;

module.exports = { MODULES, schema, singleSchema, system, singleSystem, buildUser, buildSingleUser, evaluateSchema, evaluateSystem, header };
