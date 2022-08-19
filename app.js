'use strict';

const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
var cors = require('cors');
const fs = require('fs');

// Change to true to operate on HTTPS
const HTTPS = false;

const index = require('./routes/index');
const apiLibrary = require('./routes/api/library');
const cdsServices = require('./routes/cds-services');

// Set up a default request size limit of 1mb, but allow it to be overridden via environment
const limit = process.env.CQL_SERVICES_MAX_REQUEST_SIZE || '1mb';

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

if(app.get('env') !== 'test') {
  app.use(logger(':date[iso] :remote-addr ":method :url" :status :res[content-length]'));
}
app.use(cors());
app.use(helmet());
app.use(bodyParser.json({
  limit,
  type: function (msg)  {
    return msg.headers['content-type'] && msg.headers['content-type'].startsWith('application/json');
  }
}));
app.use(bodyParser.urlencoded({
  limit,
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api/library', apiLibrary);
app.use('/cds-services', cdsServices);

// error handler
app.use((err, req, res, next) => {
  // Log the error
  console.error((new Date()).toISOString(), `ERROR: ${err.message}\n  ${err.stack}`);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Read self-signed certificates for running on HTTPS
if (HTTPS) {
  try {
    var key = fs.readFileSync(__dirname + '/certs/selfsigned.key');
    var cert = fs.readFileSync(__dirname + '/certs/selfsigned.crt');
    var options = {
      key: key,
      cert: cert
    };
  } catch (err) {
    console.error('Unable to read selfsigned.crt or selfsigned.key file');
  }
} else {
  options = null;
}

module.exports = {
  app: app,
  options: options
};
