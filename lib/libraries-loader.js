'use strict';

import { existsSync, lstatSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Library } from 'cql-execution';
import { gt } from 'semver';

class Libraries {
  constructor() {
    this._store = new Map();
  }

  addLibrary(json) {
    if (json && json.library && json.library.identifier && json.library.identifier.id) {
      const libId = json.library.identifier.id;
      const libVersion = json.library.identifier.version;
      if (! this._store.has(libId)) {
        this._store.set(libId, new Map());
      } else if (this._store.get(libId).has(libVersion)) {
        // Do a very simple check and issue a warning if the contents are different
        const loadedJSON = this._store.get(libId).get(libVersion);
        if (JSON.stringify(loadedJSON) !== JSON.stringify(json)) {
          console.error(`WARNING: Multiple copies of ${libId}:${libVersion} found with differences in content.  Only one will be loaded.`);
        }
      }
      this._store.get(libId).set(libVersion, json);
    }
  }

  all() {
    const libraries = [];
    Array.from(this._store.values()).forEach(vMap => Array.from(vMap.values()).forEach(lib => libraries.push(new Library(lib, this))));
    return libraries;
  }

  resolve(id, version) {
    if (version == null) {
      return this.resolveLatest(id);
    }
    if (this._store.has(id) && this._store.get(id).has(version)) {
      return new Library(this._store.get(id).get(version), this);
    }
    console.error(`Failed to resolve library "${id}" with version "${version}"`);
  }

  resolveLatest(id) {
    if (this._store.has(id) && this._store.get(id).size > 0) {
      let latestVersion;
      const versions = this._store.get(id).keys();
      for (const version of versions) {
        if (latestVersion == null || gt(version, latestVersion)) {
          latestVersion = version;
        }
      }
      return this.resolve(id, latestVersion);
    }
    console.error(`Failed to resolve latest version of library "${id}"`);
  }
}

var repo = new Libraries();

function load(pathToFolder) {
  if (!existsSync(pathToFolder) || !lstatSync(pathToFolder).isDirectory()) {
    console.error(`Failed to load local repository at: ${pathToFolder}.  Not a valid folder path.`);
    return;
  }

  for (const fileName of readdirSync(pathToFolder)) {
    const file = join(pathToFolder, fileName);
    const stats = lstatSync(file);
    if (stats.isFile() && !file.endsWith('.json')) {
      continue;
    } else if (stats.isDirectory()) {
      load(file);
    } else {
      const json = JSON.parse(readFileSync(file, 'utf8'));
      repo.addLibrary(json);
    }
  }
}

function get() {
  return repo;
}

function reset() {
  repo = new Libraries();
}

export default {load, get, reset};