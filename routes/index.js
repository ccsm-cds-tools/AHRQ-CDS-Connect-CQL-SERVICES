'use strict';

import { Router } from 'express';
import hooksLoader from '../lib/hooks-loader';
import libsLoader from '../lib/libraries-loader';
const router = Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  const libraries = libsLoader.get().all();
  const expressions = {};
  for (const lib of libraries) {
    const key = `${lib.source.library.identifier.id}.${lib.source.library.identifier.version}`;
    expressions[key] = [];
    for (const exp of Object.keys(lib.expressions)) {
      if (lib.expressions[exp].constructor.name == 'ExpressionDef') {
        expressions[key].push(exp);
      }
    }
  }
  res.render('index', {
    title: 'CDS Connect CQL Services',
    hooks: hooksLoader.get().all(),
    libraries: libraries,
    expressions: expressions,
    req: req
  });
});

export default router;
