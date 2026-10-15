const { z } = require('zod');

const num = z.coerce.number().transform((n) => Math.max(0, Math.min(100, Math.round(n))));
const strArr = z.array(z.string()).default([]);

const schema = z.object({
  overall_score: num,
  category_scores: z.object({ formatting: num, keywords: num, structure: num, clarity: num, impact: num }),
  job_match_percent: num.nullable().default(null),
  matched_keywords: strArr,
  missing_keywords: strArr,
  strengths: strArr,
  weaknesses: strArr,
  section_feedback: z.object({
    summary: z.string().default(''), skills: z.string().default(''), experience: z.string().default(''),
    education: z.string().default(''), projects: z.string().default(''),
  }),
  issues: z.array(z.object({ severity: z.enum(['high', 'medium', 'low']), issue: z.string(), fix: z.string() })).default([]),
  rewrite_suggestions: z.array(z.object({ original: z.string(), improved: z.string(), reason: z.string() })).default([]),
});

const system = `You are an ATS resume auditor. Given resume text, optional target role and optional job description,
return strict JSON only:
{
 "overall_score": number,
 "category_scores": { "formatting": n, "keywords": n, "structure": n, "clarity": n, "impact": n },
 "job_match_percent": number,
 "matched_keywords": string[], "missing_keywords": string[],
 "strengths": string[], "weaknesses": string[],
 "section_feedback": { "summary": string, "skills": string, "experience": string, "education": string, "projects": string },
 "issues": [{ "severity": "high"|"medium"|"low", "issue": string, "fix": string }],
 "rewrite_suggestions": [{ "original": string, "improved": string, "reason": string }]
}
All scores are integers 0-100. If no job description or target role is given, set job_match_percent to null.
"original" in rewrite_suggestions must be copied verbatim from the resume. In "improved", only rephrase: if a bullet lacks a metric, add a bracketed prompt such as [add your real number] instead of inventing one.
Do not invent employment history, metrics or skills absent from the resume.`;

const buildUser = ({ text, jobRole, jobDescription, rules }) =>
  `Target role: ${jobRole || 'not provided'}

<job_description>
${jobDescription || 'not provided'}
</job_description>

Rule-based findings already detected (for context, you may reference them):
${rules.checks.filter((c) => !c.passed).map((c) => `- ${c.label}: ${c.detail}`).join('\n') || '- none'}

<resume>
${text}
</resume>`;

module.exports = { schema, system, buildUser };
