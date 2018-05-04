const express = require("express");
const bodyParser = require('body-parser');
const Entity = require("./models/entity");

// function getLabel(req, res) {
//   const profileId = req.body.profile_id;
//   Label.findByProfileId(profileId).then((label) => {
//     // console.log('GET');
//     // console.log('profileId : ' + profileId);
//     // console.log(label);
//     if (label) {
//       res.send(label);
//     } else {
//       res.send('error');
//     }
//   });
// }

function setEntity(req, res) {
  const entityId = req.body.id;
  // console.log('SET');
  // console.log('entityId : ' + profileId);
  Entity.insertOrCreate(entityId, req.body).then((entity) => {
    if (entity) {
      res.send( entityId + ' : done');
    } else {
      res.send( entityId + ' : error');
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

  // router.use('/get/', (req, res) => {    
    // getLabel(req, res);
  // });

  router.use('/set/', (req, res) => {
    setEntity(req, res);
  });

  router.use('/deleteAll/', (req, res) => {
    deleteAllEntities(req, res);
  });

  return router;
};
