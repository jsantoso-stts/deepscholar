const ElasticsearchTools = require("../common/elasticsearch_tools");

ElasticsearchTools.initializePapers()
  .then(() => {
    console.log(`Papers' indexes have been initialized.`);
  })
  .catch(reason => {
    console.log(reason);
    console.error(`Papers' indexes have not been initialized.`);
    console.log(`StatusCode: ${reason.statusCode}`);
  });
