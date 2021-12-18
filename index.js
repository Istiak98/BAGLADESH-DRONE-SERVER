const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;
app.use(cors());
// middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kydip.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("ahmedDrone");
    const droneCollection = database.collection("drones");
    const orderCollection = database.collection("orders");
    const reviewCollection = database.collection("review");
    const usersCollection = database.collection("users");

    //GET Drones API
    app.get("/drones", async (req, res) => {
      const cursor = droneCollection.find({});
      const drones = await cursor.toArray();
      res.send(drones);
    });
    //GET Review API
    app.get("/review", async (req, res) => {
      const cursor = reviewCollection.find({});
      const review = await cursor.toArray();
      res.send(review);
    });

    // GET Single drone
    app.get("/drones/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const drone = await droneCollection.findOne(query);
      res.json(drone);
    });

    // POST API(add a new drone)
    app.post("/drones", async (req, res) => {
      const drone = req.body;
      // console.log("hit the post api", drone);
      const result = await droneCollection.insertOne(drone);
      console.log(result);
      console.log(drone);
      res.json(result);
    });

    // GET API (get all orders)
    app.get("/orders", async (req, res) => {
      const query = {};
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });
    // POST API
    app.post("/placeOrder", async (req, res) => {
      const orderDetails = req.body;
      const result = await orderCollection.insertOne(orderDetails);
      res.json(result);
    });

    // POST API(add a new review)
    app.post("/review", async (req, res) => {
      const review = req.body;
      // console.log("hit the post api", tour);
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

    // GET API (get orders by email)
    app.get("/myOrders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = await orderCollection.find(query);
      const myOrders = await cursor.toArray();
      res.send(myOrders);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(users);
      console.log(result);
      res.json(result);
    });

    // DELETE API
    app.delete("/deleteOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });

   // DELETE API (delete product by id)
        app.delete('/deleteProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await droneCollection.deleteOne(query);
            res.json(result);
        })
    app.post("/addUserInfo", async (req, res) => {
      console.log("req.body");
      const result = await usersCollection.insertOne(req.body);
      res.send(result);
      console.log(result);
    });

    //  make admin

    app.put("/makeAdmin", async (req, res) => {
      const filter = { email: req.body.email };
      const result = await usersCollection.find(filter).toArray();
      if (result) {
        const documents = await usersCollection.updateOne(filter, {
          $set: { role: "admin" },
        });
        console.log(documents);
      }
      // else {
      //   const role = "admin";
      //   const result3 = await usersCollection.insertOne(req.body.email, {
      //     role: role,
      //   });
      // }

      // console.log(result);
    });

    // check admin or not
    app.get("/checkAdmin/:email", async (req, res) => {
      const result = await usersCollection
        .find({ email: req.params.email })
        .toArray();
      // console.log(result);
      res.send(result);
    });

    // UPDATE API
    app.put("/approve/:id", async (req, res) => {
      const id = req.params.id;
      const approvedOrder = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: approvedOrder.status,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
  } finally {
    //await client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello AHMED DRONES!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
