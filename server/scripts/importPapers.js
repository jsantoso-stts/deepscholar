const ElasticsearchTools = require("../common/elasticsearch_tools");

ElasticsearchTools.importPapers(process.stdin);
console.log("Now papers have been creating.");
