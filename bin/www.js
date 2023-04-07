#!/usr/bin/env node

// Portions of this file are based on the original [CQL Services](https://github.com/AHRQ-CDS/AHRQ-CDS-Connect-CQL-SERVICES) 
// developed for the [CDS Connect](https://cds.ahrq.gov/cdsconnect) project, sponsored by the 
// [Agency for Healthcare Research and Quality](https://www.ahrq.gov/) (AHRQ), and developed under contract with AHRQ by 
// [MITRE's Health FFRDC](https://www.mitre.org/our-impact/rd-centers/health-ffrdc).
// Copyright 2016-2018 Agency for Healthcare Research and Quality.
// Licensed under the Apache License, Version 2.0 (the "License").

'use strict';

/* eslint-disable no-console */

import { app, PARAMS, httpsOptions } from '../app.js';
import pkg from 'debug';
const debug = pkg('cql-exec-service:server');
import { load, get } from '../lib/libraries-loader.js';
import { load as _load, get as _get } from '../lib/hooks-loader.js';
import { load as __load } from '../lib/code-service-loader.js';
import { load as loadAppliable, get as getAppliable } from '../lib/apply-loader.js';
import pkg2 from 'mkdirp';
const { sync } = pkg2;
import { createServer } from 'http';
import { createServer as createSecureServer } from 'https';
import { join } from 'path';
import { existsSync } from 'fs';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Check for CDS-specific configuration settings and set in app.locals if applicable
 */

if (PARAMS?.IGNORE_VSAC_ERRORS?.toLowerCase() === 'true') {
  app.locals.ignoreVSACErrors = true;
} else {
  app.locals.ignoreVSACErrors = false;
}

if (PARAMS?.COLLAPSE_CARDS?.toLowerCase() === 'true') {
  app.locals.collapseCards = true;
} else {
  app.locals.collapseCards = false;
}

if (PARAMS?.ALT_FHIR_QUERIES?.length > 0) {
  app.locals.altFhirQueries = PARAMS.ALT_FHIR_QUERIES.split(';');
} else {
  app.locals.altFhirQueries = [];
}

if (PARAMS?.SMART_IF_NO_PREFETCH?.toLowerCase() === 'true') {
  app.locals.smartIfNoPrefetch = true;
} else {
  app.locals.smartIfNoPrefetch = false;
}

if (PARAMS?.USE_HTML?.toLowerCase() === 'true') {
  app.locals.useHtml = true;
} else {
  app.locals.useHtml = false;
}

/**
 * Load local data into the local code service cache, repo, and local hooks
 */

// Appliable PlanDefinitions must be loaded before hooks, so that the latter can 
// leverage the prefetches which are generated by the former.
// NOTE: Top-level await requires Node v14.8.0 or higher.
await loadAppliable(join(__dirname, '..', 'config', 'apply'));
console.log(`Loaded ${Object.keys(getAppliable()).length} appliable PlanDefinitions`);
Object.keys(getAppliable()).forEach(pd => console.log(`  - ${pd}`));

// Load the value set cache
const codeServiceCachePath = join(__dirname, '..', '.vsac_cache');
if (!existsSync(codeServiceCachePath)) {
  sync(codeServiceCachePath);
}
__load(codeServiceCachePath);

// Load all CQL libraries
load(join(__dirname, '..', 'config', 'libraries'));
console.log(`Loaded ${get().all().length} libraries`);

// Load all configured hooks
get().all().forEach(lib => console.log(`  - ${lib.source.library.identifier.id}:${lib.source.library.identifier.version}`));
_load(join(__dirname, '..', 'config', 'hooks'));
console.log(`Loaded ${_get().all().length} hooks`);
_get().all().forEach(hook => console.log(`  - ${hook.id}`));

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(PARAMS.PORT || '3000');
app.set('port', port);

/**
 * Create HTTPS or HTTP server.
 */

const server = PARAMS.USE_HTTPS.toLocaleLowerCase() === 'true'
  ? createSecureServer(httpsOptions, app)
  : createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
  case 'EACCES':
    console.error(bind + ' requires elevated privileges');
    process.exit(1);
    break;
  case 'EADDRINUSE':
    console.error(bind + ' is already in use');
    process.exit(1);
    break;
  default:
    throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
