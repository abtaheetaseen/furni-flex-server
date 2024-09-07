const express = require('express')
const app = express()
const port = 3000
const cors = require("cors");
require('dotenv').config();
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());

// mongodb
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://iBOSLimited:do3EKdoZfnB7mHll@cluster1.ofi7kql.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const usersCollection = client.db("iBOSLimited").collection("users");
    const productsCollection = client.db("iBOSLimited").collection("products");

    app.post("/jwt", async(req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "24h"});
        res.send({token});
    })

    const verifyToken = (req, res, next) => {
        if(!req.headers.authorization){
            return res.status(403).send({message: "forbidden access"})
        }
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if(err){
                return res.status(403).send({message: "forbidden access"})
            }
            req.decoded = decoded;
            next();
        })
    }

    app.post("/users", async(req, res) => {
        const user = req.body;
        console.log(user)

        const result = await usersCollection.insertOne(user);
        res.send(result);

    })

    app.get("/users", verifyToken, async(req, res) => {
        const result = await usersCollection.find().toArray();
        res.send(result);
    })

    app.get("/products", async(req, res) => {
        const result = await productsCollection.find().toArray();
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('iBOS-E-Commerce')
})

app.listen(port, () => {
  console.log(`server running on ${port}`)
})