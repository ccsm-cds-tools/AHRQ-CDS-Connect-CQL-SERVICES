#!/usr/bin/env node

'use strict';

/* eslint-disable no-console */

import { app as _app, options as _options } from '../app.js';
// const debug = require('debug')('cql-exec-service:server');
import pkg from 'debug';
const debug = pkg('cql-exec-service:server');
import { load, get } from '../lib/libraries-loader.js';
import { load as _load, get as _get } from '../lib/hooks-loader.js';
import { load as __load } from '../lib/code-service-loader.js';
import pkg2 from 'mkdirp';
const { sync } = pkg2;
import { createServer } from 'http';
import { createServer as _createServer } from 'https';
import { join } from 'path';
import { existsSync } from 'fs';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const app = _app;
const options = _options;

/**
 * Check for CDS-specific configuration settings and set in app.locals if applicable
 */
if (process.env.IGNORE_VSAC_ERRORS && process.env.IGNORE_VSAC_ERRORS.toLowerCase() === 'true') {
  app.locals.ignoreVSACErrors = true;
}

/**
 * Load local data into the local code service cache, repo, and local hooks
 */
const codeServiceCachePath = join(__dirname, '..', '.vsac_cache');
if (!existsSync(codeServiceCachePath)) {
  sync(codeServiceCachePath);
}
__load(codeServiceCachePath);
load(join(__dirname, '..', 'config', 'libraries'));
console.log(`Loaded ${get().all().length} libraries`);
get().all().forEach(lib => console.log(`  - ${lib.source.library.identifier.id}:${lib.source.library.identifier.version}`));
_load(join(__dirname, '..', 'config', 'hooks'));
console.log(`Loaded ${_get().all().length} hooks`);
_get().all().forEach(hook => console.log(`  - ${hook.id}`));


/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTPS or HTTP server.
 */

const server = options
  ? _createServer(options, app)
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
