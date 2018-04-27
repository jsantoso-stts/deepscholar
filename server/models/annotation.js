const DB = require("../db");
const {ObjectId} = require("mongodb");

module.exports = class Annotation {
  static collection() {
    return DB.connection()
      .collection("annotations");
  }

  static findByPaperId(id) {
    return new Promise((resolve, reject) => {
      const query = {
        "paperId": id
      };
      return this.collection()
        .find(query, {projection: {_id: false, paperId: false}})
        .toArray((error, result) => {
          if (error) {
            reject(error);
          }

          resolve(result);
        });
    });
  }

  static insert(paperId, userId, anno) {
    const annotation = Object.assign(anno, {paperId, userId: new ObjectId(userId)});
    return new Promise((resolve, reject) => {
      return this.collection()
        .insertOne(annotation, (error) => {
          if (error) {
            reject(error);
          }

          resolve(annotation);
        });
    });
  }
};
