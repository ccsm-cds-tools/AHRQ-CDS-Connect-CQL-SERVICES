// Portions of this file are based on the original [CQL Services](https://github.com/AHRQ-CDS/AHRQ-CDS-Connect-CQL-SERVICES) 
// developed for the [CDS Connect](https://cds.ahrq.gov/cdsconnect) project, sponsored by the 
// [Agency for Healthcare Research and Quality](https://www.ahrq.gov/) (AHRQ), and developed under contract with AHRQ by 
// [MITRE's Health FFRDC](https://www.mitre.org/our-impact/rd-centers/health-ffrdc).
// Copyright 2016-2018 Agency for Healthcare Research and Quality.
// Licensed under the Apache License, Version 2.0 (the "License").
'use strict';

import express, { static as static_middleware } from 'express';
import { join } from 'path';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import pkg from 'body-parser';
const { json, urlencoded } = pkg;
import helmet from 'helmet';
import cors from 'cors';
import { readFileSync } from 'fs';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import index from './routes/index.js';
import apiLibrary from './routes/api/library.js';
import cdsServices from './routes/cds-services.js';

// Which port to expose the service on
const PORT = process.env.PORT ?? '3000';

// Set up a default request size limit of 1mb, but allow it to be overridden via environment
const LIMIT = process.env.CQL_SERVICES_MAX_REQUEST_SIZE || '1mb';

// Change to true to operate on HTTPS
const USE_HTTPS = process.env.CQL_SERVICES_USE_HTTPS ?? 'false';

// Collapse cards down into a single information card
const COLLAPSE_CARDS = process.env.COLLAPSE_CARDS ?? 'false';

// Semi-colon separated list of alternative FHIR queries (full URLs).
// Context tokens are used the same way they are with the prefetch.
// See: https://cds-hooks.hl7.org/1.0/#prefetch-tokens
const ALT_FHIR_QUERIES = process.env.ALT_FHIR_QUERIES ?? '';

// Flag to ignore errors when connecting to VSAC
const IGNORE_VSAC_ERRORS = process.env.IGNORE_VSAC_ERRORS ?? 'false';

// Flag to attempt a SMART connection if no prefetch is provided
const SMART_IF_NO_PREFETCH = process.env.SMART_IF_NO_PREFETCH ?? 'false';

const PARAMS = {
  PORT,
  LIMIT,
  USE_HTTPS,
  COLLAPSE_CARDS,
  ALT_FHIR_QUERIES,
  IGNORE_VSAC_ERRORS,
  SMART_IF_NO_PREFETCH
};

console.log(PARAMS);

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
  LIMIT,
  type: function (msg)  {
    return msg.headers['content-type'] && msg.headers['content-type'].startsWith('application/json');
  }
}));
app.use(urlencoded({
  LIMIT,
  extended: false
}));
app.use(cookieParser());
app.use(static_middleware(join(__dirname, 'public')));

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
if (USE_HTTPS.toLocaleLowerCase() === 'true') {
  try {
    var key = readFileSync(__dirname + '/certs/https.key');
    var cert = readFileSync(__dirname + '/certs/https.crt');
    var httpsOptions = {
      key: key,
      cert: cert
    };
  } catch (err) {
    console.error('Unable to read https.crt or https.key file');
  }
} else {
  httpsOptions = null;
}

export { app, PARAMS, httpsOptions };
