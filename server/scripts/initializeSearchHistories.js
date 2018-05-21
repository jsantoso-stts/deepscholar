const ElasticsearchTools = require("../common/elasticsearch_tools");

ElasticsearchTools.initializeSearchHistories()
  .then(() => {
    console.log(`SearchHistories' indexes have been initialized.`);
  })
  .catch(reason => {
    console.log(reason);
    console.error(`SearchHistories' indexes have not been initialized.`);
    console.log(`StatusCode: ${reason.statusCode}`);
  });
