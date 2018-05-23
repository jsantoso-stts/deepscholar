const DatabaseTools = require("../common/database_tools");
const ElasticsearchTools = require("../common/elasticsearch_tools");

DatabaseTools.deleteAllEntities();
ElasticsearchTools.initializeEntities()
  .then(() => {
    console.log(`Entities' indexes have been initialized.`);
  })
  .catch(reason => {
    console.log(reason);
    console.error(`Entities' indexes have not been initialized.`);
    console.log(`StatusCode: ${reason.statusCode}`);
  });