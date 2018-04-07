const path = require("path");
const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const rp = require("request-promise");

module.exports = class ElasticsearchTools {
  static deleteIndexes(host, port) {
    return rp({
      method: "DELETE",
      url: `http://${host}:${port}/*`
    });
  }

  static initializeIndexes(host, port) {
    const indexSchemeDir = path.join(__dirname, "../", "index_schemes");
    return Promise.all([
      "papers",
      "search_histories"
    ].map((indexSchemeName) => {
      return readFile(path.join(indexSchemeDir, `${indexSchemeName}.json`), 'utf8')
        .then(json => {
          return rp({
            method: "PUT",
            url: `http://${host}:${port}/${indexSchemeName}`,
            body: json
          });
        });
    }));
  }
};
