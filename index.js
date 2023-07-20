const express = require("express");
const cors = require("cors");
const { authorMiddleware } = require("./authorMiddleware");
const itemsRouter = require("./api/items");

const app = express();
app.use(cors());

app.all("*", authorMiddleware);
app.get("/", (req, res) => {
  res.send("Hey this is my API running 💖");
});
app.use("/items", itemsRouter);

app.listen(8000, () => console.log("Server is up!"));

app.get("/items");
app.get("/items/:id");
