const {MongoClient} = require("mongodb");

class DB {
  constructor() {
    this.db = null;

    MongoClient.connect(`mongodb://deepscholar.database:27017/${process.env.MONGODB_APPLICATION_DATABASE}`, {
      auth: {
        user: process.env.MONGODB_APPLICATION_USER,
        password: process.env.MONGODB_APPLICATION_PASS
      }
    })
      .then((client) => {
        this.db = client.db(process.env.MONGODB_APPLICATION_DATABASE);
      });
  }

  connection() {
    return this.db;
  }
}

module.exports = new DB();
