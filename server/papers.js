const express = require("express");
const Auth = require("./auth");
const Annotation = require("./models/annotation");
const Papers = require("./models/papers");

module.exports = class {
  static router() {
    const router = new express.Router();

    router.get(`/:paperId/annotations`, (req, res) => {
      return Papers.exists(req.params.paperId)
        .then(exists => {
          if (!exists) {
            res.status(404)
              .end();
            return;
          }

          return Annotation.findByPaperId(req.params.paperId)
            .then(annotations => {
              res.json(annotations);
            });
        });
    });

    router.post(`/:paperId/annotations`, (req, res) => {
      return Papers.exists(req.params.paperId)
        .then(exists => {
          if (!exists) {
            res.status(404)
              .end();
            return;
          }

          return Annotation.insert(req.params.paperId, req.user._id, req.body)
            .then((annotation) => {
              Reflect.deleteProperty(annotation, "_id");
              res.send(annotation)
                .end();
            });
        });
    });

    return router;
  }
};
