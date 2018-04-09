const express = require("express");
const ElasticsearchTools = require("./common/elasticsearch_tools");

module.exports = class Admin {
  static router() {
    const router = new express.Router();

    router.delete(`/indexes`, (req, res) => {
      ElasticsearchTools.deleteIndexes("deepscholar.elasticsearch", 9200)
        .then(res.status(200)
          .end())
        .catch(reason => {
          res.status(reason.statusCode)
            .end();
        });
    });

    router.post(`/indexes/init`, (req, res) => {
      ElasticsearchTools.initializeIndexes("deepscholar.elasticsearch", 9200)
        .then(res.status(200)
          .end())
        .catch(reason => {
          res.status(reason.statusCode)
            .end();
        });
    });

    return router;
  }
};
