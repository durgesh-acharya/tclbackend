const express = require('express')
const app = express()
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');

const port = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

//declare routes
const userRouter = require('./routes/users');


// use routes
app.use('/users',userRouter);



app.get('/api', (req, res) => {
  res.send('Hello Worlds with cicd!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})