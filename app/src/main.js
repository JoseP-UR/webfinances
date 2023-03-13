const express = require("express");
const path = require("path");
const mongodb = require("mongodb");
const bodyParser = require("body-parser");

const app = express();
const mongoUser = "root";
const mongoPassword = "root";
const mongoUrl = `mongodb://${mongoUser}:${mongoPassword}@mongodb:27017`;
const client = new mongodb.MongoClient(mongoUrl);

app.use(bodyParser.json());

app.get("/js/*", (req, res) => {
  res.header("Content-Type", "text/javascript");
  res.sendFile(path.join(__dirname, "../public", req.url));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/api/movements", async (req, res) => {
  const db = client.db("finances");
  const collection = db.collection("movements");
  res.json(await collection.find({}).toArray());
});

app.post("/api/movements", async (req, res) => {
  console.log(req.body);
  const db = client.db("finances");
  const collection = db.collection("movements");
  const result = await collection.insertOne(req.body);
  res.json(
    await collection.findOne({
      _id: result.insertedId,
    })
  );
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
