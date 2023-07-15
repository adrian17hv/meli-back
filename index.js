const express = require("express");
const cors = require("cors");
const { authorMiddleware } = require("./authorMiddleware");
const itemsRouter = require("./api/items");

const app = express();
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Reemplaza con tu origen permitido
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.all("*", authorMiddleware);
app.get("/", (req, res) => {
  res.send("Hey this is my API running 💖");
});
app.use("/items", itemsRouter);

app.listen(8000, () => console.log("Server is up!"));

app.get("/items");
app.get("/items/:id");
