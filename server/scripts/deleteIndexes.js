const ElasticsearchTools = require("../common/elasticsearch_tools");

ElasticsearchTools.deleteIndexes()
  .then(() => {
    console.log(`All Indexes have been deleted.`);
  })
  .catch(reason => {
    console.error(`Indexes have not been deleted.`);
    console.log(`StatusCode: ${reason.statusCode}`);
  });
