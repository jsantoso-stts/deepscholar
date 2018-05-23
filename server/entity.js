const express = require("express");
const bodyParser = require('body-parser');
const Entity = require("./models/entity");

function setEntity(req, res) {
  const entityId = req.body.id;
  Entity.insertOrCreate(entityId, req.body).then((entity) => {
    if (entity) {
      res.send(`DB save done : entityId => ${entityId}`);
    } else {
      res.send(`DB save error : entityId => ${entityId}`);
    }
  });
}

function updateEntity(req, res) {
  const entityId = req.body.id;
  Entity.insertOrCreate(entityId, req.body).then((entityDB) => {
    if (entityDB) {
      Entity.esUpdate(entityId, req.body).then((entityES) => {
        if (entityES) {
          res.send('done');
        } else {
          res.send('error');
        }
      });
    } else {
      res.send('error');
    }
  });
}

function deleteAllEntities(req, res) {
  Entity.deleteAll().then((entity) => {
    if (entity) {
      res.send('successfully deleted');
    } else {
      res.send('error');
    }
  });
}

module.exports = (app) => {

  const router = new express.Router();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  router.use('/set/', (req, res) => {
    setEntity(req, res);
  });

  router.use('/update/', (req, res) => {
    updateEntity(req, res);
  });  

  router.use('/deleteAll/', (req, res) => {
    deleteAllEntities(req, res);
  });

  return router;
};
