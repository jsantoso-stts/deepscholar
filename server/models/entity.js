const DB = require("../db");

module.exports = class Entity {
  static collection() {
    return DB.connection()
      .collection("entities");
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = {
        "entity.id": id
      };
      return this.collection()
        .findOne(query, (error, result) => {
          if (error) {
            reject(error);
          }

          resolve(result);
        });
    });
  }

  static insertOrCreate(id, data) {

    return this.findById(id)
      .then((result) => {

        const entity = {
          entity: data
        };

        if (result) {
          const query = {"entity.id": id};
          return this.collection()
            .update(query, entity)
            .then(() => {
              return Object.assign({_id: entity.insertedId}, entity);
            });
        }
        return this.collection()
          .insertOne(entity)
          .then(() => {
            return Object.assign({_id: entity.insertedId}, entity);
          });


      });
  }

  static deleteAll() {
    return this.collection().drop();
  }
};
