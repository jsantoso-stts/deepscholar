const SearchkitExpress = require("searchkit-express");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const engines = require('consolidate');
const searchHistory = require("./models/search_history");
const Auth = require("./auth");
const Setting = require("./models/settings");
const Admin = require("./admin");
const Papers = require("./papers");
const passport = require("passport");

app.set('views', `${__dirname}/views`);
app.engine('html', engines.mustache);
app.set('view engine', 'html');
app.use('/api/documents', express.static('documents'));
app.use(bodyParser.json());
app.set("port", process.env.PORT || 3001);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

const defineSearchkitRouter = (typeName) => {
  app.use(`/api/papers/${typeName}`, (req, res, next) => {
      Setting.findOrCreate("es:query:multi_match:fields", [
        "articleTitle^10",
        "abstract^5",
        "authors^1"
      ])
        .then(settings => {
          req.fields = settings.value;
          return next();
        });
    }, SearchkitExpress.createRouter({
      host: "http://deepscholar.elasticsearch:9200",
      index: `papers/${typeName}`,
      queryProcessor: (query, req) => {
        if (/.+\/text$/.test(req.baseUrl)) {
          if (query.query.bool) {
            query.query.bool.must[0].bool.should[0].multi_match.fields = req.fields;
          }

          Auth.getVerifiedUserId(req.headers)
            .then(userId => {
              searchHistory.insert(query, userId);
            })
            .catch(console.log);
        }

        return query;
      }
    })
  );
};

defineSearchkitRouter("text");
defineSearchkitRouter("tables");
defineSearchkitRouter("figs");

app.use("/api/papers", Papers.router(app));
app.use("/api/auth", Auth.router(app));
app.use("/api/admin", passport.authenticate(['jwt'], {session: false}), (req, res, next) => {
  if (req.user.isAdmin) {
    return next();
  }

  res.status(401)
    .end();
}, Admin.router(app));
app.use("/api/label", require("./label.js")(app));
app.use("/api/entity", require("./entity.js")(app));

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`);
});
