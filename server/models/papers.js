const elasticsearch = require("elasticsearch");

module.exports = new class Papers {
  constructor() {
    this.client = new elasticsearch.Client({
      host: "deepscholar.elasticsearch:9200",
      log: "error"
    });
  }

  exists(paperId) {
    return this.client.exists({
      index: "papers",
      type: "text",
      id: paperId
    })
      .then(exists => {
        console.log(exists);
        return exists;
      })
      .catch((e) => {
        console.log(e);
        return false;
      });
  }
}();
