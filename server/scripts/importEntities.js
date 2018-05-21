const ElasticsearchTools = require("../common/elasticsearch_tools");

ElasticsearchTools.importEntities(process.stdin);
console.log("Now papers have been creating.");