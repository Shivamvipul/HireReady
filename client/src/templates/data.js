import { uid } from '../utils/cn';

export const SECTION_LABELS = {
  summary: 'Summary', experience: 'Experience', projects: 'Projects', education: 'Education', skills: 'Skills',
  certifications: 'Certifications', achievements: 'Achievements', languages: 'Languages', links: 'Links', custom: 'Custom sections',
};
export const ALL_SECTIONS = Object.keys(SECTION_LABELS);

export const FONT_OPTIONS = [
  { id: 'template', label: 'Template default', stack: null },
  { id: 'inter', label: 'Inter', stack: 'Inter, Arial, sans-serif' },
  { id: 'source', label: 'Source Sans', stack: "'Source Sans 3', Arial, sans-serif" },
  { id: 'poppins', label: 'Poppins', stack: 'Poppins, Arial, sans-serif' },
  { id: 'merri', label: 'Merriweather', stack: 'Merriweather, Georgia, serif' },
  { id: 'lora', label: 'Lora', stack: 'Lora, Georgia, serif' },
  { id: 'playfair', label: 'Playfair Display', stack: "'Playfair Display', Georgia, serif" },
  { id: 'arial', label: 'Arial', stack: 'Arial, Helvetica, sans-serif' },
  { id: 'georgia', label: 'Georgia', stack: 'Georgia, serif' },
];

// Multi-color resume themes (primary = headings/banners/sidebar, secondary = subtitle/links/icons, side = light sidebar tint).
export const THEMES = [
  { id: 'ocean', name: 'Ocean Blue', primary: '#1d4ed8', secondary: '#0369a1', side: '#eff6ff' },
  { id: 'royal', name: 'Royal Blue', primary: '#1e40af', secondary: '#4338ca', side: '#eef2ff' },
  { id: 'blue-orange', name: 'Blue & Orange', primary: '#1e3a8a', secondary: '#c2410c', side: '#eff6ff' },
  { id: 'orange-blue', name: 'Orange & Blue', primary: '#c2410c', secondary: '#1d4ed8', side: '#fff7ed' },
  { id: 'aqua', name: 'Aqua', primary: '#0e7490', secondary: '#0f766e', side: '#ecfeff' },
  { id: 'forest', name: 'Forest Green', primary: '#15803d', secondary: '#0f766e', side: '#f0fdf4' },
  { id: 'mint', name: 'Charcoal & Mint', primary: '#111827', secondary: '#047857', side: '#f3f4f6' },
  { id: 'slate', name: 'Slate Grey', primary: '#334155', secondary: '#475569', side: '#f1f5f9' },
  { id: 'gold', name: 'Navy & Gold', primary: '#1e293b', secondary: '#a16207', side: '#f8fafc' },
  { id: 'purple', name: 'Creative Purple', primary: '#6d28d9', secondary: '#be185d', side: '#f5f3ff' },
  { id: 'rose', name: 'Rose', primary: '#be123c', secondary: '#9a3412', side: '#fff1f2' },
  { id: 'burgundy', name: 'Burgundy', primary: '#7f1d1d', secondary: '#b45309', side: '#fef2f2' },
];

export const defaultSettings = () => ({ theme: null, accent: null, font: 'template', fontSize: 13, spacing: 'template', sectionOrder: null, hidden: [], footerTag: true });

export const contactDefaults = (user = {}) => ({
  name: user.name || '',
  title: '',
  email: user.email || 'shivamvipul14@gmail.com',
  phone: '+91 7631801415',
  location: '',
  website: '',
  linkedin: 'linkedin.com/in/shivamvipul14',
  github: 'github.com/shivamvipul14',
});

export const mergeContact = (contact = {}) => ({
  ...contactDefaults(),
  ...Object.fromEntries(Object.entries(contact || {}).filter(([, value]) => value !== '' && value !== null && value !== undefined)),
});

export const emptyData = (user = {}) => ({
  contact: contactDefaults(user),
  summary: '',
  education: [], experience: [], projects: [], skills: [], certifications: [], achievements: [], languages: [], links: [], custom: [],
});

// Fictional demo content used for template thumbnails only.
export const sampleData = () => ({
  contact: { name: 'Alex Morgan', title: 'Full-Stack Developer', email: 'shivamvipul14@gmail.com', phone: '+91 7631801415', location: 'Austin, TX', website: '', linkedin: 'linkedin.com/in/shivamvipul14', github: 'github.com/shivamvipul14' },
  summary: 'Full-stack developer with experience building and shipping web applications in React and Node.js. Comfortable owning features from database design to deployment.',
  experience: [
    { id: 'e1', role: 'Software Engineer', company: 'Brightwave', location: 'Remote', start: 'Jan 2022', end: 'Present', bullets: '• Built a customer dashboard in React used by the support team\n• Designed REST APIs and MongoDB schemas for the billing module\n• Mentored two junior developers through code review' },
    { id: 'e2', role: 'Junior Developer', company: 'Northfield Labs', location: 'Austin, TX', start: 'Jun 2020', end: 'Dec 2021', bullets: '• Maintained internal tools in Node.js and Express\n• Wrote unit and integration tests for the order service' },
  ],
  projects: [
    { id: 'p1', title: 'TaskFlow', description: '• Kanban app with drag-and-drop and real-time updates\n• Deployed with CI on Render and Vercel', tech: 'React, Node.js, MongoDB', link: 'github.com/alexmorgan/taskflow' },
    { id: 'p2', title: 'PriceWatch', description: '• Tracks product prices and sends email alerts', tech: 'Express, Cron, SendGrid', link: 'pricewatch.example.com' },
  ],
  education: [{ id: 'd1', school: 'University of Texas', degree: 'B.S.', field: 'Computer Science', start: '2016', end: '2020', details: '' }],
  skills: [{ id: 's1', group: 'Languages', items: 'JavaScript, TypeScript, SQL, Python' }, { id: 's2', group: 'Frameworks', items: 'React, Express, Tailwind CSS' }, { id: 's3', group: 'Tools', items: 'Git, Docker, MongoDB, Jest' }],
  certifications: [{ id: 'c1', name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', year: '2023' }],
  achievements: [{ id: 'a1', text: 'Hackathon finalist, 2021' }],
  languages: [{ id: 'l1', name: 'English', level: 'Native' }, { id: 'l2', name: 'Spanish', level: 'Conversational' }],
  links: [{ id: 'k1', label: 'Portfolio', url: 'alexmorgan.dev' }],
  custom: [],
});

export const newEntry = (section) => {
  const base = { id: uid() };
  const shapes = {
    education: { school: '', degree: '', field: '', start: '', end: '', details: '' },
    experience: { company: '', role: '', location: '', start: '', end: '', bullets: '' },
    projects: { title: '', description: '', tech: '', link: '' },
    skills: { group: '', items: '' },
    certifications: { name: '', issuer: '', year: '' },
    achievements: { text: '' },
    languages: { name: '', level: '' },
    links: { label: '', url: '' },
    custom: { title: '', content: '' },
  };
  return { ...base, ...shapes[section] };
};
