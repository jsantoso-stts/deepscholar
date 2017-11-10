const {parseString} = require('fast-xml2js');
const fs = require('fs');
const path = require('path');
const glob = require("glob");

const dirPath = process.argv[2];

const indexMetaData = {
  _index: "documents",
  _type: "lang"
};

glob(`${dirPath}/*`, (error, files) => {
  if (error) {
    console.log(error);
    return;
  }
  files.forEach((filePath) => {
    fs.readFile(filePath, 'utf8', (error, xml) => {
      if (error) {
        console.log(error);
        throw error;
      }

      parseString(xml, (error, result) => {
        if (error) {
          console.log(error);
          throw error;
        }

        const data = result.article;

        const id = path.basename(filePath, '.xml');
        const actionAndMetaData = {index: Object.assign(indexMetaData, {_id: id})};
        data.id = id;

        //Convert to camel case
        data["articleTitle"] = data["article-title"];
        delete data["article-title"];
        data.author && data.author.forEach((value, index) => {
          data.author[index]["givenNames"] = data.author[index]["given-names"];
          delete data.author[index]["given-names"];
        });

        //Array to single string
        data["articleTitle"] = data["articleTitle"][0];
        data["abstract"] = data["abstract"][0];
        if (data.author) {
          data.author = data.author.map(value => {
            const surname = value.surname[0];
            const givenNames = value.givenNames[0];
            return {surname, givenNames};
          });
        }

        console.log(JSON.stringify(actionAndMetaData));
        console.log(JSON.stringify(data, (key, value) => {
          // Remove line breaks on head and tail that are generates by fast-xml2js.
          if (typeof value === 'string') {
            return value.trim();
          }

          return value;
        }));
      });
    });
  });
});