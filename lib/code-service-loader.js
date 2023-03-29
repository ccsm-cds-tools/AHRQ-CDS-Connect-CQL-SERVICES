// Portions of this file are based on the original [CQL Services](https://github.com/AHRQ-CDS/AHRQ-CDS-Connect-CQL-SERVICES) 
// developed for the [CDS Connect](https://cds.ahrq.gov/cdsconnect) project, sponsored by the 
// [Agency for Healthcare Research and Quality](https://www.ahrq.gov/) (AHRQ), and developed under contract with AHRQ by 
// [MITRE's Health FFRDC](https://www.mitre.org/our-impact/rd-centers/health-ffrdc).
// Copyright 2016-2018 Agency for Healthcare Research and Quality.
// Licensed under the Apache License, Version 2.0 (the "License").
'use strict';

import { existsSync, lstatSync } from 'fs';
import { CodeService } from 'cql-exec-vsac';

var service = new CodeService();

function load(pathToFolder) {
  if (!existsSync(pathToFolder) || !lstatSync(pathToFolder).isDirectory()) {
    console.error(`Failed to load code service cache at: ${pathToFolder}.  Not a valid folder path.`);
    return;
  }

  service = new CodeService(pathToFolder, true);
}

function get() {
  return service;
}

export default {load, get};
export { get, load };