const ElasticsearchTools = require("../common/elasticsearch_tools");

ElasticsearchTools.importIndexes(process.stdin);
console.log("Now indexes have been creating.");
