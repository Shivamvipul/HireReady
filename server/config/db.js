const dns = require('node:dns');
const mongoose = require('mongoose');
const env = require('./env');

module.exports = async function connectDB() {
  if (env.dnsServers.length) dns.setServers(env.dnsServers);
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  console.log('MongoDB connected');
};
