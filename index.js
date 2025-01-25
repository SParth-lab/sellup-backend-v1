const express = require("express");
const cors = require("cors");
const UserRoute = require("./Routes/UserRoute.js")
const ProductRoute = require("./Routes/ProductRoute.js")
const ReviewRoute = require("./Routes/ReviewRoute.js")
const CategoryRoute = require("./Routes/CategoryRoute.js")

require("./config/db.config.js")

const app = express()
app.use(cors())
app.use(express.json());


app.use("/users", UserRoute);
app.use("/products", ProductRoute);
app.use("/reviews", ReviewRoute);
app.use("/categories", CategoryRoute);


app.get("/", (req, res) => {
  return res.send("OK")
});

app.use('*', function (req, res) {
  res.json({
      statusCode: 404,
      message: 'Page not found',
      data: null,
  });
});

module.exports = app;