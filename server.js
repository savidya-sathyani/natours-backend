const mongoose = require('mongoose');
const dotenv = require('dotenv');

// As a safety net for uncaught exceptions
process.on('uncaught Exception', (err) => {
  console.error(`Error:: Uncaught Exception. Shutting down.\n${err}`);
  process.exit(1);
});

// Env Variable setup. Should be before app require.
dotenv.config({ path: './config.env' });
const app = require('./app');

// DB Connection
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.set('strictQuery', true);
mongoose.connect(DB).then(() => console.log('DB Connection Successful!!'));

// Server start
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App is running on port:${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.error(
    `${err.name} ${err.message}\nError:: Unhandled Rejection. Shutting down.`
  );
  server.close(() => {
    process.exit(1);
  });
});
