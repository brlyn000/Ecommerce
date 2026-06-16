const isDev = process.env.NODE_ENV !== 'production';

const logger = {
  info: (...args) => { if (isDev) process.stdout.write(`[INFO] ${args.join(' ')}\n`); },
  warn: (...args) => process.stderr.write(`[WARN] ${args.join(' ')}\n`),
  error: (...args) => process.stderr.write(`[ERROR] ${args.join(' ')}\n`),
};

module.exports = logger;
