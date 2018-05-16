const elasticsearch = require("elasticsearch");

module.exports = new class Papers {
  constructor() {
    this.client = new elasticsearch.Client({
      host: "deepscholar.elasticsearch:9200",
      log: "error"
    });
  }

  get(paperId) {
    return this.client.get({
      index: "papers",
      type: "text",
      id: paperId,
      _source: [
        "pdf",
        "xml",
        "pdftxt"
      ]
    })
      .then(paper => {
        console.log(paper);
        return paper;
      })
      .catch((e) => {
        console.log(e);
        return false;
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
