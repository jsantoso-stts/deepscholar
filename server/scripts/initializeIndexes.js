const ElasticsearchTools = require("../common/elasticsearch_tools");

ElasticsearchTools.initializeIndexes()
  .then(() => {
    console.log(`All Indexes have been created.`);
  })
  .catch(reason => {
    console.log(reason);
    console.error(`Indexes have not been created.`);
    console.log(`StatusCode: ${reason.statusCode}`);
  });
