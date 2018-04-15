const common = require("./common.js");
const ElasticsearchTools = require("../common/elasticsearch_tools");

(async () => {
  const config = await common.loadDeepScholarConfig();

  ElasticsearchTools.importIndexes(config.DS_BULK_LIMIT_BYTE_PER_REQUEST, process.stdin);
  console.log("Now indexes have been creating.");
})();
