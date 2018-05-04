const common = require("./common.js");
const DatabaseTools = require("../common/database_tools");

(async () => {
  const config = await common.loadDeepScholarConfig();

  DatabaseTools.importEntities(config, process.stdin);

})();
