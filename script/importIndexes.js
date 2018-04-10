const common = require("./common.js");
const ElasticsearchTools = require("../server/common/elasticsearch_tools");

const filePath = process.argv[2];

(async () => {
  const config = await common.loadDeepScholarConfig();

  ElasticsearchTools.importIndexes("localhost", config.DS_ES_PORT, config.DS_BULK_LIMIT_BYTE_PER_REQUEST, filePath);
  console.log("Now indexes have been creating.");
})();
