const DB = require("../db");
const {ObjectId} = require("mongodb");

module.exports = class Annotation {
  static collection() {
    return DB.connection()
      .collection("annotations");
  }

  static findByQuery(query) {
    return new Promise((resolve, reject) => {
      return this.collection()
        .find(query, {projection: {_id: false, paperId: false, type: false}})
        .toArray((error, result) => {
          if (error) {
            reject(error);
          }

          resolve(result);
        });
    });
  }

  static replace(paperId, userId, type, anno) {
    const filter = {type, paperId, userId: new ObjectId(userId)};
    const annotation = Object.assign(anno, filter);
    return new Promise((resolve, reject) => {
      return this.collection()
        .replaceOne(filter, annotation, {upsert: true}, (error, result) => {
          if (error) {
            reject(error);
          }

          resolve({annotation, upserted: Boolean(result.result.upserted)});
        });
    });
  }
};
