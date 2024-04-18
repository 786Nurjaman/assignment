const express = require('express')
const app = express()
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./db/connnect');
const ticket = require('./routes/route');
require('dotenv').config();

const port = process.env.PORT || 8000;
const url = process.env.URL || 'mongodb://localhost:27017/my_database'

app.use(cors());

app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

app.use('/api/v1', ticket);

app.use( (req, res) => res.status(404).send('Route does not exist'));

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

const start = async () => {
    try {
      await connectDB(url);
      app.listen(port, () =>
        console.log(`Server is listening on port ${port}...`)
      );
    } catch (error) {
      console.log(error);
    }
  };
  
start();