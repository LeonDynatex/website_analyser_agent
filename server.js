require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const analyzeRoute = require('./routes/analyze');
const cmsRoute = require('./routes/cms');
const auth = require('./middleware/auth'); // disabled by default

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('combined', {stream: fs.createWriteStream('./logs/access.log', {flags: 'a'})}));
app.use(express.static('public'));

app.use('/analyze', /*auth,*/ analyzeRoute);   // enable auth when ready
app.use('/cms', /*auth,*/ cmsRoute);           // enable auth when ready

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Website Analyzer Agent running on port', PORT));
