const express = require("express");
const Annotation = require("./models/annotation");
const Papers = require("./models/papers");
const passport = require("passport");

module.exports = class PaperAPI {
  static router() {
    const router = new express.Router();

    router.get(`/:paperId`, (req, res) => {
      return Papers.get(req.params.paperId)
        .then(paper => {
          if (!paper) {
            res.status(404)
              .end();
            return;
          }

          res.json(paper._source);
        });
    });

    router.get(`/:paperId/annotations/:type(pdf|xml)`, passport.authenticate(['jwt'], {session: false}), (req, res) => {
      return PaperAPI.getAnnotations(req, res);
    });

    router.post(`/:paperId/annotations/:type(pdf|xml)`, passport.authenticate(['jwt'], {session: false}), (req, res) => {
      return PaperAPI.postAnnotations(req, res);
    });

    return router;
  }

  static getAnnotations(req, res) {
    return Papers.exists(req.params.paperId)
      .then(exists => {
        if (!exists) {
          res.status(404)
            .end();
          return;
        }

        const query = {
          "paperId": req.params.paperId,
          type: req.params.type
        };
        return Annotation.findByQuery(query)
          .then(annotations => {
            res.json(annotations);
          });
      });
  }

  static postAnnotations(req, res) {
    return Papers.exists(req.params.paperId)
      .then(exists => {
        if (!exists) {
          res.status(404)
            .end();
          return;
        }

        const anno = Object.assign(req.body, {type: req.params.type});
        return Annotation.insert(req.params.paperId, req.user._id, anno)
          .then((annotation) => {
            Reflect.deleteProperty(annotation, "_id");
            Reflect.deleteProperty(annotation, "type");
            res.send(annotation)
              .end();
          });
      });
  }
};
