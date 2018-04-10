const common = require("./common.js");
const ElasticsearchTools = require("../server/common/elasticsearch_tools");

(async () => {
  const config = await common.loadDeepScholarConfig();

  ElasticsearchTools.deleteIndexes("localhost", config.DS_ES_PORT)
    .then(console.log(`All Indexes have been deleted.`))
    .catch(reason => {
      console.error(`Indexes have not been deleted.`);
      console.log(`StatusCode: ${reason.statusCode}`);
    });
})();
