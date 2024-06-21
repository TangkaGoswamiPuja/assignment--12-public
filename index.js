const express = require("express");
const cors = require("cors");
const jwt =require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config()
const app = express ();
const port = process.env.PORT|| 5000;


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
    const testCollection = client.db ("doctorDoctor").collection('allTest');
    const slotsCollection = client.db ("doctorDoctor").collection('slots');
    const usersCollection = client.db ("doctorDoctor").collection('users');

// jwt jwt 
app.post('/jwt',async(req,res)=>{
  const user = req.body;
const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
res.send({token});

  // const query = {email:users.email}
  // const recentUser =await usersCollection.findOne(query);
  // if(recentUser){
  //   return res.send({message: 'user already exists',insertedId : null})
  // }
  // const result= await usersCollection.insertOne(users);
});

    // user related api 
    app.get('/users',async(req,res)=>{
      const result = await
      usersCollection.find().toArray();
      res.send(result);
  })

    app.post('/users',async(req,res)=>{
      const users = req.body;
      const query = {email:users.email}
      const recentUser =await usersCollection.findOne(query);
      if(recentUser){
        return res.send({message: 'user already exists',insertedId : null})
      }
      const result= await usersCollection.insertOne(users);
      res.send(result)
    });

     app.patch('/users/admin/:id',async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateDoc ={
        $set:{
          role:'admin'
        }
      }
  const result= await usersCollection.updateOne(filter,updateDoc);
  res.send(result);
  });

    app.delete('/users/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
  const result= await usersCollection.deleteOne(query);
  res.send(result);
  })

  
  
    //  alltest api 
    app.get("/alltest",async(req,res)=>{
        const result = await
        testCollection.find().toArray();
        res.send(result);
    })
    app.get('/alltest/:id' ,async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
    const result= await testCollection.findOne(query);
    res.send(result);
    })

    // slots 
    app.get('/slots',async(req,res)=>{
      const email = req.query.email;
      const query = {email : email };
      const result = await
      slotsCollection.find(query).toArray();
      res.send(result);
    });
    app.post('/slots',async(req,res)=>{
      const slotItem = req.body;
      const result= await slotsCollection.insertOne(slotItem);
      res.send(result)
    })
    app.delete('/slots/:id' ,async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
  const result= await slotsCollection.deleteOne(query);
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


app.get('/',(req,res)=>{
    res.send('Doc is running')
    })
    
    app.listen(port,()=>{
        console.log(`Doc is running on port${port}`)
    })



   