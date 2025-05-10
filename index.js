const express = require("express");
const cors = require("cors");
const path = require("path");
const UserRoute = require("./Routes/UserRoute.js")
const ProductRoute = require("./Routes/ProductRoute.js")
const ReviewRoute = require("./Routes/ReviewRoute.js")
const CategoryRoute = require("./Routes/CategoryRoute.js")
const EmailRoute = require("./Routes/EmailRoute.js")
const AreaRoute = require("./Routes/AreaRoute.js")
const OTPRoute = require("./Routes/OTPRoute.js")
require("./config/db.config.js")

const app = express()
app.use(cors())
app.use(express.json());

// Serve assetlinks.json from .well-known directory
app.use('/.well-known', express.static(path.join(__dirname, 'well-known')));


app.use("/users", UserRoute);
app.use("/products", ProductRoute);
app.use("/reviews", ReviewRoute);
app.use("/categories", CategoryRoute);
app.use("/email", EmailRoute);
app.use("/area", AreaRoute);
app.use("/via-whatsapp", OTPRoute);


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