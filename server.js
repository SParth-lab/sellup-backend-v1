const app = require("./index.js")
const dotenv = require("dotenv");

dotenv.config();


const port = process.env.PORT;


// console.log(`Node environment: ${process.env.NODE_ENV}`)
app.listen(port, () => {
    console.log(`Server started listening at port http://localhost:${port}`)
})
