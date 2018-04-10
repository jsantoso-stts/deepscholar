const common = require("./common.js");
const {MongoClient} = require("mongodb");

(async () => {
  const config = await common.loadDeepScholarConfig();

  const client = await MongoClient.connect(`mongodb://localhost:${config.DS_DB_PORT}/${config.MONGODB_APPLICATION_DATABASE}`, {
    auth: {
      user: config.MONGODB_APPLICATION_USER,
      password: config.MONGODB_APPLICATION_PASS
    }
  });
  const db = await client.db(config.MONGODB_APPLICATION_DATABASE);
  const result = await db.dropDatabase();

  if (result) {
    console.log(`All databases have been deleted.`);
  }

  client.close();
})();
