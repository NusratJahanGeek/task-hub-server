const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a81ulqy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Validate a task object
function validateTask(task) {
  if (!task.title) {
    return 'Title is required';
  }
  // Add additional validation rules if needed
  return null; // Validation passed
}

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    //await client.connect();

    const taskCollection = client.db('taskHub').collection('tasks');

    app.get('/tasks', async (req, res) => {
      const tasks = await taskCollection.find().toArray();
      res.json(tasks);
    });
   
    app.post('/tasks', async (req, res) => {
        const newTask = req.body;
        const result = await taskCollection.insertOne(newTask);
          res.send(result); 
    });

    app.put('/tasks/:id', async (req, res) => {
      const taskId = req.params.id;
      const updatedTask = req.body;
      const result = await taskCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { status: updatedTask.status } }
        );
        res.json(result.modifiedCount > 0);
    });

    app.delete('/tasks/:id', async (req, res) => {
        const taskId = req.params.id;
        const result = await taskCollection.deleteOne({ _id: new ObjectId(taskId) });
        res.json(result.deletedCount > 0);
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('TaskHub is Running');
});

app.listen(port, () => {
  console.log(`TaskHub is running on port ${port}`);
});
