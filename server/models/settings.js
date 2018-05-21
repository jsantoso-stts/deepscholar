const DB = require("../db");

module.exports = class Setting {
  static collection() {
    return DB.connection()
      .collection("settings");
  }

  static findByName(name) {
    return new Promise((resolve, reject) => {
      const query = {
        name
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

  static insert(setting) {
    return new Promise((resolve, reject) => {
      return this.collection()
        .insertOne(setting, (error, result) => {
          if (error) {
            reject(error);
          }

          resolve(result);
        });
    });
  }

  static findOrCreate(name, defaultValue) {
    return this.findByName(name)
      .then((setting) => {
        if (setting) {
          return setting;
        }

        const newSetting = {
          name,
          value: defaultValue
        };

        return this.insert(newSetting)
          .then(() => {
            return Object.assign({_id: newSetting.insertedId}, newSetting);
          });
      });
  }
};
