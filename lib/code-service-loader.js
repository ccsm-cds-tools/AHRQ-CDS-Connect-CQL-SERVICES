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