const express = require("express");
const DatabaseTools = require("./common/database_tools");
const ElasticsearchTools = require("./common/elasticsearch_tools");
const multer = require('multer');
const upload = multer({dest: '/tmp/uploads'});

module.exports = class Admin {
  static router() {
    const router = new express.Router();

    router.post(`/papers/initialize`, (req, res) => {
      ElasticsearchTools.initializePapers()
        .then(res.send(JSON.stringify({})))
        .catch(reason => {
          res.status(reason.statusCode)
            .end();
        });
    });

    router.post(`/papers/import`, upload.single('indexes'), (req, res) => {
      ElasticsearchTools.importPapers(req.file.path);
      res.send(JSON.stringify({}));
    });

    router.post(`/entities/initialize`, (req, res) => {
      DatabaseTools.deleteAllEntities();
      ElasticsearchTools.initializeEntities()
        .then(res.send(JSON.stringify({})))
        .catch(reason => {
          res.status(reason.statusCode)
            .end();
        });
    });

    router.post(`/entities/import`, upload.single('indexes'), (req, res) => {
      ElasticsearchTools.importEntities(req.file.path);
      res.send(JSON.stringify({}));
    });

    return router;
  }
};
