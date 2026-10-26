const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const { ok } = require('./utils/response');
const { apiLimiter } = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.clientUrl.split(',').map((s) => s.trim()), credentials: true }));
app.use(express.json({ limit: '4mb' })); // PDF export posts rendered HTML
app.use(cookieParser());
if (!env.isProd) app.use(morgan('dev'));
app.get('/', (req, res) => ok(res, { name: 'HireReady API', status: 'up', health: '/api/health' }));
app.use('/api', apiLimiter);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/ats', require('./routes/atsRoutes'));
app.use('/api/interview', require('./routes/interviewRoutes'));
app.use('/api/resumes', require('./routes/resumeRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/linkedin', require('./routes/linkedinRoutes'));
app.use('/api', require('./routes/miscRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
