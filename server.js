const app = require("./index.js")
const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
dotenv.config();


const port = process.env.PORT;

// Serve assetlinks.json from .well-known directory
app.use('/.well-known', express.static(path.join(__dirname, 'well-known')));


// console.log(`Node environment: ${process.env.NODE_ENV}`)
app.listen(port, () => {
    console.log(`Server started listening at port http://localhost:${port}`)
})
