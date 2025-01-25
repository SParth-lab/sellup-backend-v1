import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Server } from 'socket.io';
import cors from 'cors'
import UserRoute from "./Routes/UserRoute.js";
import ProductRoute from "./Routes/ProductRoute.js";
import ReviewRoute from "./Routes/ReviewRoute.js";
import CategoryRoute from "./Routes/CategoryRoute.js";
dotenv.config();
const app = express();
app.use(express.json({ extended: true })); // Added extended: true to support nested objects

var corsOptions = {
  credentials: true,
  origin: '*', // Removed whitelist and set origin to allow all
  methods: ["GET", "PUT", "POST", "DELETE"],
}
app.use(cors(corsOptions))
const port = process.env.PORT || 5000;






app.use("/users", UserRoute);
app.use("/products", ProductRoute);
app.use("/reviews", ReviewRoute);
app.use("/categories", CategoryRoute);
// app.use("/api/product", Product);
// app.use("/api/review", Review);
app.get("/", (req, res) => {
  return res.send("OK")
});




mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Connected With DB Successfull"))
  .catch((e) => console.log("Db Connection Failed", e));

const server = app.listen(port, () => {
  console.log(`Server is Listening on PORT ${port}`);
})

new Server(server);