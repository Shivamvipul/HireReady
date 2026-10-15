const { z } = require('zod');

const num = z.coerce.number().transform((n) => Math.max(0, Math.min(100, Math.round(n))));
const arr = z.array(z.string()).default([]);

const schema = z.object({
  profile_score: num,
  headline_options: z.array(z.string()).min(1).max(5),
  about_rewrite: z.string(),
  experience_suggestions: z.array(z.object({ original: z.string(), improved: z.string() })).default([]),
  skills_to_add: arr,
  skills_to_remove: arr,
  keywords_for_role: arr,
  banner_photo_tips: arr,
  custom_url_tips: z.string().default(''),
  featured_section_ideas: arr,
  recommendations_strategy: z.string().default(''),
  networking_content_plan: arr,
  completeness_checklist: z.array(z.object({ item: z.string(), done: z.coerce.boolean() })).default([]),
  recruiter_search_tips: arr,
});

const system = `You are a LinkedIn profile optimization expert. Given the user's profile content without a target role or job description, return strict JSON only. Focus on transferable strengths and broad recruiter discoverability:
{
 "profile_score": number,
 "headline_options": string[3],
 "about_rewrite": string,
 "experience_suggestions": [{ "original": string, "improved": string }],
 "skills_to_add": string[], "skills_to_remove": string[], "keywords_for_role": string[],
 "banner_photo_tips": string[], "custom_url_tips": string,
 "featured_section_ideas": string[], "recommendations_strategy": string,
 "networking_content_plan": string[],
 "completeness_checklist": [{ "item": string, "done": boolean }],
 "recruiter_search_tips": string[]
}
Exactly 3 headline options. "original" must be copied from the profile content. Only rephrase and reframe existing content. Never fabricate roles, titles or achievements. skills_to_add must be skills that the profile content already evidences or that the user can honestly add if true: phrase uncertain ones as "Add only if true: ...". networking_content_plan should contain 4 weekly themes for a 30-day plan.`;

const buildUser = ({ url, role, jd, text }) =>
  `LinkedIn URL: ${url || 'not provided'}\nTarget role: ${role || 'not provided'}\n\n<job_description>\n${jd || 'not provided'}\n</job_description>\n\n<profile>\n${text}\n</profile>`;

module.exports = { schema, system, buildUser };
