'use strict';

import express, { static } from 'express';
import { join } from 'path';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import { readFileSync } from 'fs';

// Change to true to operate on HTTPS
const USE_HTTPS = process.env.CQL_SERVICES_USE_HTTPS ?? false;

import index from './routes/index';
import apiLibrary from './routes/api/library';
import cdsServices from './routes/cds-services';

// Set up a default request size limit of 1mb, but allow it to be overridden via environment
const limit = process.env.CQL_SERVICES_MAX_REQUEST_SIZE || '1mb';

const app = express();

// view engine setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'pug');

if(app.get('env') !== 'test') {
  app.use(logger(':date[iso] :remote-addr ":method :url" :status :res[content-length]'));
}
app.use(cors());
app.use(helmet());
app.use(json({
  limit,
  type: function (msg)  {
    return msg.headers['content-type'] && msg.headers['content-type'].startsWith('application/json');
  }
}));
app.use(urlencoded({
  limit,
  extended: false
}));
app.use(cookieParser());
app.use(static(join(__dirname, 'public')));

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
if (USE_HTTPS) {
  try {
    var key = readFileSync(__dirname + '/certs/https.key');
    var cert = readFileSync(__dirname + '/certs/https.crt');
    var options = {
      key: key,
      cert: cert
    };
  } catch (err) {
    console.error('Unable to read https.crt or https.key file');
  }
} else {
  options = null;
}

export const app = app;
export const options = options;
