const express = require("express");
const ElasticsearchTools = require("./common/elasticsearch_tools");
const multer = require('multer');
const upload = multer({dest: '/tmp/uploads'});

module.exports = class Admin {
  static router() {
    const router = new express.Router();

    router.delete(`/indexes`, (req, res) => {
      ElasticsearchTools.deleteIndexes("deepscholar.elasticsearch", 9200)
        .then(res.send(JSON.stringify({})))
        .catch(reason => {
          res.status(reason.statusCode)
            .end();
        });
    });

    router.post(`/indexes/init`, (req, res) => {
      ElasticsearchTools.initializeIndexes("deepscholar.elasticsearch", 9200)
        .then(res.send(JSON.stringify({})))
        .catch(reason => {
          res.status(reason.statusCode)
            .end();
        });
    });

    router.post(`/indexes/import`, upload.single('indexes'), (req, res) => {
      ElasticsearchTools.importIndexes("deepscholar.elasticsearch", 9200, process.env.DS_BULK_LIMIT_BYTE_PER_REQUEST, req.file.path);
      res.send(JSON.stringify({}));
    });

    return router;
  }
};
