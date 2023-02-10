const mongoose = require('mongoose');
const dotenv = require('dotenv');

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
app.listen(port, () => {
  console.log(`App is running on port:${port}...`);
});
