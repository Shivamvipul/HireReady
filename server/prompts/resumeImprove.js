const { z } = require('zod');

const schema = z.object({
  improved: z.string().min(1),
  notes: z.array(z.string()).default([]),
  missing_info: z.array(z.string()).default([]),
});

const system = `You are a professional resume editor. Return strict JSON only:
{ "improved": string, "notes": string[], "missing_info": string[] }
Rewrite the provided text to be clearer, more concise and more impactful: strong action verbs, specific wording, consistent tense.
Keep the same facts. Do NOT add employers, titles, dates, tools, certifications, percentages or numbers that are not in the user's content.
If a bullet would be stronger with a metric, list that in "missing_info" (e.g. "Add how many users this served") instead of inventing one.
For bullet lists, keep one bullet per line starting with "• ".
Mode "summary": write a 2-4 sentence professional summary using ONLY the resume details supplied.`;

const buildUser = ({ mode, section, text, context }) =>
  `Mode: ${mode}\nSection: ${section}\n\n<resume>\n${context}\n</resume>\n\nText to ${mode === 'summary' ? 'base the summary on (may be empty)' : 'improve'}:\n<resume>\n${text || ''}\n</resume>`;

module.exports = { schema, system, buildUser };
