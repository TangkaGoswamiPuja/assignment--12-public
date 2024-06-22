const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mdaaiuq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();
    const testCollection = client.db("doctorDoctor").collection('allTest');
    const slotsCollection = client.db("doctorDoctor").collection('slots');
    const usersCollection = client.db("doctorDoctor").collection('users');

    // jwt jwt 
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '12h' })
      res.send({ token });
    });
    // middleware

    const verifyToken = (req, res, next) => {
      // console.log("inside verify token", req.headers.authorization);

      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' })
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
      })
    }

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const isAdmin = user?.role === 'admin';
      if (!isAdmin) {
        return res.status(403), send({ message: 'forbidden access' })

      }
      next();
    }

    // user related api 
    app.get('/users', verifyToken,verifyAdmin, async (req, res) => {
      const result = await
        usersCollection.find().toArray();
      res.send(result);
    })

    app.get('/users/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      if (
        email !== req.decoded.email
      ) {
        return res.status(403).send({ message: 'unathorized access ' })
      }
      const query = { email: email };
      const user = await
        usersCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin });
    })

    app.post('/users', async (req, res) => {
      const users = req.body;
      const query = { email: users.email }
      const recentUser = await usersCollection.findOne(query);
      if (recentUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await usersCollection.insertOne(users);
      res.send(result)
    });

    app.patch('/users/admin/:id',verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete('/users/:id',verifyToken,verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    })



    //  alltest api 
    app.get("/alltest", async (req, res) => {
      const result = await
        testCollection.find().toArray();
      res.send(result);
    });
    app.post('/alltest',verifyToken,verifyAdmin, async (req, res) => {
      const testItem = req.body;
      const result = await testCollection.insertOne(testItem);
      res.send(result)
    })

    app.patch('/alltest/:id',async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          title: item.title,
        short_description:item.short_description,
price :item.price,
date:item.date,
time:item.time,
slots:item.slots,
image :item.image
        }
      }
      const result = await testCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get('/alltest/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await testCollection.findOne(query);
      res.send(result);
    });

    app.delete('/alltest/:id',verifyToken,verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await testCollection.deleteOne(query);
      res.send(result);
    });



    // slots 
    app.get('/slots', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await
        slotsCollection.find(query).toArray();
      res.send(result);
    });
    app.post('/slots', async (req, res) => {
      const slotItem = req.body;
      const result = await slotsCollection.insertOne(slotItem);
      res.send(result)
    })
    app.delete('/slots/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await slotsCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Doc is running')
})

app.listen(port, () => {
  console.log(`Doc is running on port${port}`)
})



