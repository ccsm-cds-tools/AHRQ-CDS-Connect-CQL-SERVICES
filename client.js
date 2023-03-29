// Portions of this file are based on the original [CQL Services](https://github.com/AHRQ-CDS/AHRQ-CDS-Connect-CQL-SERVICES) 
// developed for the [CDS Connect](https://cds.ahrq.gov/cdsconnect) project, sponsored by the 
// [Agency for Healthcare Research and Quality](https://www.ahrq.gov/) (AHRQ), and developed under contract with AHRQ by 
// [MITRE's Health FFRDC](https://www.mitre.org/our-impact/rd-centers/health-ffrdc).
// Copyright 2016-2018 Agency for Healthcare Research and Quality.
// Licensed under the Apache License, Version 2.0 (the "License").
'use strict';

/* eslint-disable no-console */
import { createReadStream } from 'fs';
import { join } from 'path';
import Commander from 'commander';
import pkg2 from 'request';
const { post, get } = pkg2; 

const DEFAULT_EXEC_EP = 'http://localhost:3000/api/library/USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102/version/1.1.0';
const DEFAULT_EXEC_MSG = join('test', 'examples', 'exec', 'DSTU2', 'unhealthy_patient.json');
Commander.command('exec-post')
  .alias('ep')
  .description(`Post a JSON message to a library endpoint.  Options can be passed to\n` +
            `  specify the endpoint and message to post.  If not specified, the\n` +
            `  following defaults are used:\n` +
            `    --endpoint ${DEFAULT_EXEC_EP}\n`+
            `    --message ${DEFAULT_EXEC_MSG}`)
  .option('-e, --endpoint <url>', 'The endpoint to post the message to', DEFAULT_EXEC_EP)
  .option('-m, --message <path>', 'The path containing the JSON message to post', DEFAULT_EXEC_MSG)
  .action((options) => {
    console.log('--------------- START --------------');
    const postOptions = {
      url: options.endpoint,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    createReadStream(options.message)
      .on('error', (err) => {
        console.log(err);
        console.log('--------------- DONE ---------------');
      })
      .pipe(post(postOptions, (err, resp, body) => {
        if (err) {
          console.error(err);
          console.log('--------------- DONE ---------------');
          return;
        }
        console.log(`STATUS: ${resp.statusCode} ${resp.statusMessage}`);
        console.log('--------------- HEADERS ------------');
        for (const key of Object.keys(resp.headers)) {
          console.log(key, ':', resp.headers[key]);
        }
        console.log('--------------- BODY ---------------');
        if (resp.headers['content-type'] && resp.headers['content-type'].indexOf('json') != -1) {
          console.log(JSON.stringify(JSON.parse(body), null, 2));
        } else {
          console.log(body);
        }
        console.log('--------------- DONE ---------------');
      }));
  });

const DEFAULT_HOOKS_DISCOVER_EP = 'http://localhost:3000/cds-services';
Commander.command('hooks-discover')
  .alias('hd')
  .description(`Get the CDS Hooks discovery endpoint.  Options can be passed to\n` +
            `  specify the endpoint.  If not specified, the following default is used:\n` +
            `    --endpoint ${DEFAULT_HOOKS_DISCOVER_EP}\n`)
  .option('-e, --endpoint <url>', 'The endpoint to post the message to', DEFAULT_HOOKS_DISCOVER_EP)
  .action((options) => {
    console.log('--------------- START --------------');
    const getOptions = {
      url: options.endpoint,
      headers: {
        'Accept': 'application/json'
      }
    };
    get(getOptions, (err, resp, body) => {
      if (err) {
        console.error(err);
        console.log('--------------- DONE ---------------');
        return;
      }
      console.log(`STATUS: ${resp.statusCode} ${resp.statusMessage}`);
      console.log('--------------- HEADERS ------------');
      for (const key of Object.keys(resp.headers)) {
        console.log(key, ':', resp.headers[key]);
      }
      console.log('--------------- BODY ---------------');
      if (resp.headers['content-type'] && resp.headers['content-type'].indexOf('json') != -1) {
        console.log(JSON.stringify(JSON.parse(body), null, 2));
      } else {
        console.log(body);
      }
      console.log('--------------- DONE ---------------');
    });
  });

const DEFAULT_HOOKS_CALL_EP = 'http://localhost:3000/cds-services/statin-use';
const DEFAULT_HOOKS_MSG = join('test', 'examples', 'hooks', 'DSTU2', 'unhealthy_patient.json');
Commander.command('hooks-call')
  .alias('hc')
  .description(`Call a CDS Hook.  Options can be passed to specify the endpoint and message to post.\n` +
            `  If not specified, the following defaults are used:\n` +
            `    --endpoint ${DEFAULT_HOOKS_CALL_EP}\n`+
            `    --message ${DEFAULT_HOOKS_MSG}`)
  .option('-e, --endpoint <url>', 'The endpoint to post the message to', DEFAULT_HOOKS_CALL_EP)
  .option('-m, --message <path>', 'The path containing the JSON message to post', DEFAULT_HOOKS_MSG)
  .action((options) => {
    console.log('--------------- START --------------');
    const postOptions = {
      url: options.endpoint,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    createReadStream(options.message)
      .on('error', (err) => {
        console.log(err);
        console.log('--------------- DONE ---------------');
      })
      .pipe(post(postOptions, (err, resp, body) => {
        if (err) {
          console.error(err);
          console.log('--------------- DONE ---------------');
          return;
        }
        console.log(`STATUS: ${resp.statusCode} ${resp.statusMessage}`);
        console.log('--------------- HEADERS ------------');
        for (const key of Object.keys(resp.headers)) {
          console.log(key, ':', resp.headers[key]);
        }
        console.log('--------------- BODY ---------------');
        if (resp.headers['content-type'] && resp.headers['content-type'].indexOf('json') != -1) {
          console.log(JSON.stringify(JSON.parse(body), null, 2));
        } else {
          console.log(body);
        }
        console.log('--------------- DONE ---------------');
      }));
  });

Commander.parse(process.argv);

