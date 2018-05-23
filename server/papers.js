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

    router.put(`/:paperId/annotations/:type(pdf|xml)`, passport.authenticate(['jwt'], {session: false}), (req, res) => {
      return PaperAPI.putAnnotations(req, res);
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

  static putAnnotations(req, res) {
    return Papers.exists(req.params.paperId)
      .then(exists => {
        if (!exists) {
          res.status(404)
            .end();
          return;
        }

        const anno = req.body;
        return Annotation.replace(req.params.paperId, req.user._id, req.params.type, anno)
          .then(result => {
            const statusCode = result.upserted ? 201 : 200;
            Reflect.deleteProperty(result.annotation, "_id");
            Reflect.deleteProperty(result.annotation, "type");
            res.status(statusCode)
              .send(result.annotation)
              .end();
          });
      });
  }
};
