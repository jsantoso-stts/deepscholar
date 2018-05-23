const path = require("path");
const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const rp = require("request-promise");
const readline = require('readline');
const {ReadableStream} = require('memory-streams');
const Ajv = require('ajv');
const DatabaseTools = require("./database_tools");

module.exports = class ElasticsearchTools {
  static get AUTHORITY() {
    return "deepscholar.elasticsearch:9200";
  }

  static initializePapers() {
    return ElasticsearchTools.initializeIndex("papers");
  }

  static initializeEntities() {
    return ElasticsearchTools.initializeIndex("entities");
  }

  static initializeSearchHistories() {
    return ElasticsearchTools.initializeIndex("search_histories");
  }

  static async initializeIndex(type) {
    await rp({
      method: "DELETE",
      url: `http://${ElasticsearchTools.AUTHORITY}/${type}`
    });

    if (type === 'entities') {
      return false;
    }

    const mappingsDir = path.join(__dirname, "mappings");
    const json = await readFile(path.join(mappingsDir, `${type}.json`), 'utf8');
    await rp({
      method: "PUT",
      url: `http://${ElasticsearchTools.AUTHORITY}/${type}`,
      body: json
    });
  }

  static async importPapers(filePathOrStream) {
    function createRequest() {
      const stream = new ReadableStream("");

      stream.pipe(rp({
        method: "POST",
        url: `http://${ElasticsearchTools.AUTHORITY}/_bulk`
      }));

      return stream;
    }

    function finishRequest(stream, count) {
      stream.push(null);
      console.log(`Inserted ${count} papers.`);
    }

    const indexName = "papers";

    const schemaFile = await readFile(path.join(__dirname, "schemas", "papers.json"), {encoding: "utf8"})
      .catch(console.log);
    const schema = JSON.parse(schemaFile);
    const ajv = new Ajv();
    const validate = ajv.compile(schema);

    // It is recommended that file size are between 5MB to 15MB per 1 bulk api request.
    // https://www.elastic.co/guide/en/elasticsearch/guide/current/bulk.html#_how_big_is_too_big
    // Please adjust suitable limit byte size to DS_BULK_LIMIT_BYTE_PER_REQUEST
    let processedByte = 0;
    let processedPapers = 0;
    let stream = null;
    let inputStream = null;
    if (typeof filePathOrStream === "string") {
      inputStream = fs.createReadStream(filePathOrStream);
    } else {
      inputStream = filePathOrStream;
    }

    readline.createInterface(inputStream, {})
      .on("line", line => {
        if (processedByte > process.env.DS_BULK_LIMIT_BYTE_PER_REQUEST) {
          if (stream) {
            finishRequest(stream, processedPapers);
            stream = null;
          }
          processedByte = 0;
          processedPapers = 0;
        }
        if (stream === null) {
          stream = createRequest();
        }
        processedByte += Buffer.byteLength(line, 'utf8');
        processedPapers += 1;

        const json = JSON.parse(line);
        const valid = validate(json);
        if (!valid) {
          console.log(validate.errors);
          return;
        }

        const papers = json;
        Object.keys(papers)
          .forEach(id => {
            const paper = papers[id];
            const {tables, figs} = paper;
            Reflect.deleteProperty(paper, "tables");
            Reflect.deleteProperty(paper, "figs");

            const textMeta = {index: {_index: indexName, _type: "text", _id: id}};
            stream.append(`${JSON.stringify(textMeta)}\n${JSON.stringify(paper)}\n`);

            const tablesMeta = {index: {_index: indexName, _type: "tables", _parent: id}};
            [tables || []].forEach(table => {
              stream.append(`${JSON.stringify(tablesMeta)}\n${JSON.stringify(table)}\n`);
            });

            const figsMeta = {index: {_index: indexName, _type: "figs", _parent: id}};
            [figs || []].forEach(fig => {
              stream.append(`${JSON.stringify(figsMeta)}\n${JSON.stringify(fig)}\n`);
            });
          });
      })
      .on("close", () => {
        finishRequest(stream, processedPapers);
      });
  }

  static importEntities(filePathOrStream) {
    function createRequest() {
      const stream = new ReadableStream("");

      stream.pipe(rp({
        method: "POST",
        url: `http://${ElasticsearchTools.AUTHORITY}/_bulk`
      }));

      return stream;
    }

    function finishRequest(stream, count, jsonForDB) {
      stream.push(null);
      DatabaseTools.importEntities(jsonForDB);
      console.log(`Inserted ${count} entities.`);
    }

    const indexName = "entities";

    // It is recommended that file size are between 5MB to 15MB per 1 bulk api request.
    // https://www.elastic.co/guide/en/elasticsearch/guide/current/bulk.html#_how_big_is_too_big
    // Please adjust suitable limit byte size to DS_BULK_LIMIT_BYTE_PER_REQUEST
    let processedByte = 0;
    let processedEntities = 0;
    let stream = null;
    let inputStream = null;

    let jsonForDB = {};
    if (typeof filePathOrStream === "string") {
      inputStream = fs.createReadStream(filePathOrStream);
    } else {
      inputStream = filePathOrStream;
    }

    readline.createInterface(inputStream, {})
      .on("line", line => {
        if (processedByte > process.env.DS_BULK_LIMIT_BYTE_PER_REQUEST) {
          if (stream) {
            finishRequest(stream, processedEntities, jsonForDB);
            stream = null;
            jsonForDB = {};
          }
          processedByte = 0;
          processedEntities = 0;
        }
        if (stream === null) {
          stream = createRequest();
        }
        processedByte += Buffer.byteLength(line, 'utf8');
        processedEntities += 1;

        const json = JSON.parse(line);

        const entity = json;

        const datetime = new Date();
        entity.update = datetime.getTime();

        const textMeta = {index: {_index: indexName, _type: "entities", _id: entity.id}};
        stream.append(`${JSON.stringify(textMeta)}\n${JSON.stringify(entity)}\n`);

        jsonForDB[entity.id] = entity;

      })
      .on("close", () => {
        finishRequest(stream, processedEntities, jsonForDB);
      });
  }
};
