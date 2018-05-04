const fs = require("fs");
const request = require('request');
const readline = require('readline');
const Ajv = require('ajv');

module.exports = class DatabaseTools {

  static importEntities(config, filePathOrStream) {

    function validateSchema(schemaFile) {
      const ajv = new Ajv();
      const schemaTxt = schemaFile.replace(/entity/g, 'string');
      const schema = JSON.parse(schemaTxt);
      return ajv.compile(schema);
    }

    function saveEntityToDB(json) {
      const headers = {'Content-Type': 'application/json'};
      const port = config.DS_SERVER_PORT;
      const path = '/api/entity/set/';
      const options = {
        url: `http://localhost:${port}${path}`,
        method: 'POST',
        headers: headers,
        json: true,
        form: json
      };
      request(options, (error, response, body) => {
          console.log(body);
      });
    }

    function finishRequest(count) {
      console.log(`Inserted ${count} entities.`);
    }

    const bytePerRequest = config.DS_BULK_LIMIT_BYTE_PER_REQUEST;

    let processedByte = 0;
    let processedEntities = 0;
    let inputStream = null;
    if (typeof filePathOrStream === "string") {
      inputStream = fs.createReadStream(filePathOrStream);
    } else {
      inputStream = filePathOrStream;
    }

    let schemaFile = '';
    let isSchema = true;
    let validate;

    readline.createInterface(inputStream, {})
      .on("line", line => {

        if (processedByte > bytePerRequest) {
            processedByte = 0;
            processedEntities = 0;
        }

        processedByte += Buffer.byteLength(line, 'utf8');

        if (isSchema) {
        // for schema file
          schemaFile += `${line}\n`;
          if (line === "}") {
            validate = validateSchema(schemaFile);
            isSchema = false;
          }
        } else {
        // for data file
          processedEntities += 1;
          const json = JSON.parse(line);
          const valid = validate(json);
          if (!valid) {
            console.log(validate.errors);
            return;
          }

          saveEntityToDB(json);
        }
    })
    .on("close", () => {
        finishRequest(processedEntities);
    });
  }

  static deleteAllEntities(config) {

    function deleteAllEntitiesFromDB() {
      const headers = {'Content-Type': 'application/json'};
      const port = config.DS_SERVER_PORT;
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
