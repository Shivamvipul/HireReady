import api from './client';

const d = (p) => p.then((r) => r.data.data);
const form = (file, extra = {}, field = 'file') => {
  const f = new FormData();
  if (file) f.append(field, file);
  Object.entries(extra).forEach(([k, v]) => v !== undefined && v !== null && f.append(k, v));
  return f;
};

export const auth = {
  register: (b) => d(api.post('/auth/register', b)),
  login: (b) => d(api.post('/auth/login', b)),
  forgotPassword: (b) => d(api.post('/auth/forgot-password', b)),
  resetPassword: (b) => d(api.post('/auth/reset-password', b)),
  logout: () => d(api.post('/auth/logout')),
  me: () => d(api.get('/auth/me')),
  update: (b) => d(api.put('/auth/me', b)),
};
export const dashboard = { get: () => d(api.get('/dashboard')) };
export const upload = {
  resumeText: (file) => d(api.post('/upload/resume-text', form(file))),
  photo: (blob) => d(api.post('/upload/photo', form(new File([blob], 'photo.jpg', { type: 'image/jpeg' }), {}, 'photo'))),
};
export const ats = {
  analyze: ({ file, resumeText, jobRole, jobDescription, fileName }) =>
    d(api.post('/ats/analyze', form(file, { resumeText: file ? undefined : resumeText, jobRole, jobDescription, fileName }))),
  history: () => d(api.get('/ats/history')),
  get: (id) => d(api.get(`/ats/${id}`)),
  remove: (id) => d(api.delete(`/ats/${id}`)),
};
export const interview = {
  generate: (b) => d(api.post('/interview/generate', b)),
  regenerate: (b) => d(api.post('/interview/regenerate', b)),
  evaluate: (b) => d(api.post('/interview/evaluate', b)),
  history: () => d(api.get('/interview/history')),
  get: (id) => d(api.get(`/interview/${id}`)),
  remove: (id) => d(api.delete(`/interview/${id}`)),
  toggle: (id, b) => d(api.patch(`/interview/${id}/bookmark`, b)),
};
export const resumes = {
  list: () => d(api.get('/resumes')),
  get: (id) => d(api.get(`/resumes/${id}`)),
  create: (b) => d(api.post('/resumes', b)),
  update: (id, b) => d(api.put(`/resumes/${id}`, b)),
  remove: (id) => d(api.delete(`/resumes/${id}`)),
  duplicate: (id) => d(api.post(`/resumes/${id}/duplicate`)),
  aiImprove: (id, b) => d(api.post(`/resumes/${id}/ai-improve`, b)),
  download: (id, format, body) => api.post(`/resumes/${id}/download/${format}`, body, { responseType: 'blob' }).then((r) => r.data),
  getPublic: (slug) => d(api.get(`/resumes/public/${slug}`)),
};
export const linkedin = {
  optimize: (b) => d(api.post('/linkedin/optimize', b)),
  history: () => d(api.get('/linkedin/history')),
  get: (id) => d(api.get(`/linkedin/${id}`)),
  remove: (id) => d(api.delete(`/linkedin/${id}`)),
};
export const templates = { list: () => d(api.get('/templates')) };
