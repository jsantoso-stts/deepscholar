const express = require("express");
const ElasticsearchTools = require("./common/elasticsearch_tools");
const multer = require('multer');
const upload = multer({dest: '/tmp/uploads'});

module.exports = class Admin {
  static router() {
    const router = new express.Router();

    router.delete(`/indexes`, (req, res) => {
      ElasticsearchTools.deleteIndexes()
        .then(res.send(JSON.stringify({})))
        .catch(reason => {
          res.status(reason.statusCode)
            .end();
        });
    });

    router.post(`/indexes/init`, (req, res) => {
      ElasticsearchTools.initializeIndexes()
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

    return router;
  }
};
