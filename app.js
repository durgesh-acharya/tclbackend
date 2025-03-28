const express = require('express')
const app = express()
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');

const port = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

//declare routes

const locationRouter = require('./routes/locations');
const staycategoriesRouter = require('./routes/staycategories');
const durationsRouter = require('./routes/durations');
const locationdurationsRouter = require('./routes/locationdurations');
const destinationroutesRouter = require('./routes/destinationrotes');
// use routes
app.use('/api/locations',locationRouter);
app.use('/api/staycategories',staycategoriesRouter);
app.use('/api/durations',durationsRouter);
app.use('/api/locationdurations',locationdurationsRouter);
app.use('/api/destinationroutes',destinationroutesRouter);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());


app.get('/api', (req, res) => {
  res.send('Travelers Clan!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})