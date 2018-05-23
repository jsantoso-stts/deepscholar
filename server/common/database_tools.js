const request = require('request');

module.exports = class DatabaseTools {

  static importEntities(json) {

    function saveEntitiesToDB(entity) {
      const headers = {'Content-Type': 'application/json'};
      const port = process.env.DS_SERVER_PORT;
      const path = '/api/entity/set/';
      const options = {
        url: `http://localhost:${port}${path}`,
        method: 'POST',
        headers: headers,
        json: true,
        form: entity
      };
      request(options, (error, response, body) => {
        if (body && body.match(/error/)) {
          console.log(body);
        }
      });
    }

    const entities = json;
    Object.keys(entities)
      .forEach(id => {
        const entity = entities[id];
        saveEntitiesToDB(entity);
      });
  }

  static deleteAllEntities() {

    function deleteAllEntitiesFromDB() {
      const headers = {'Content-Type': 'application/json'};
      const port = process.env.DS_SERVER_PORT;
      const path = '/api/entity/deleteAll/';
      const options = {
        url: `http://localhost:${port}${path}`,
        method: 'GET',
        headers: headers,
        json: true
      };
      request(options, (error, response, body) => {
          console.log(body);
      });
    }

    deleteAllEntitiesFromDB();
  }
};
