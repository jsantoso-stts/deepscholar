const path = require("path");
const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const rp = require("request-promise");
const readline = require('readline');
const {ReadableStream} = require('memory-streams');
const Ajv = require('ajv');

module.exports = class ElasticsearchTools {
  static deleteIndexes(host, port) {
    return rp({
      method: "DELETE",
      url: `http://${host}:${port}/*`
    });
  }

  static initializeIndexes(host, port) {
    const mappingsDir = path.join(__dirname, "mappings");
    return Promise.all([
      "papers",
      "search_histories"
    ].map((fileName) => {
      return readFile(path.join(mappingsDir, `${fileName}.json`), 'utf8')
        .then(json => {
          return rp({
            method: "PUT",
            url: `http://${host}:${port}/${fileName}`,
            body: json
          });
        });
    }));
  }

  static async importIndexes(host, port, bytePerRequest, filePath) {
    function createRequest() {
      const stream = new ReadableStream("");

      stream.pipe(rp({
        method: "POST",
        url: `http://${host}:${port}/_bulk`
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
    readline.createInterface(fs.createReadStream(filePath), {})
      .on("line", line => {
        if (processedByte > bytePerRequest) {
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
};