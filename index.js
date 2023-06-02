const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a81ulqy.mongodb.net/?retryWrites=true&w=majority`;

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

    const taskCollection = client.db('taskHub').collection('tasks');

    app.get('/tasks', async (req, res) => {
      const tasks = await taskCollection.find().toArray();
      res.json(tasks);
    });

    app.post('/tasks', async (req, res) => {
      try {
        const newTask = req.body;
        const result = await taskCollection.insertOne(newTask);
        if (result.insertedCount === 1) {
          res.json(newTask);
        } else {
          res.status(500).json({ error: 'Failed to insert task' });
        }
      } catch (error) {
        console.error('An error occurred while adding the task:', error);
        res.status(500).json({ error: 'An error occurred while adding the task' });
      }
    });

    app.put('/tasks/:id', async (req, res) => {
      const taskId = req.params.id;
      const updatedTask = req.body;

      try {
        const result = await taskCollection.updateOne({ _id: new ObjectId(taskId) }, { $set: { status: updatedTask.status } });
        res.json(result.modifiedCount > 0);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update task' });
      }
    });

    app.delete('/tasks/:id', async (req, res) => {
      try {
        const taskId = req.params.id;
        const result = await taskCollection.deleteOne({ _id: new ObjectId(taskId) });
        res.json(result.deletedCount > 0);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete task' });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('TaskHub is Running');
});

app.listen(port, () => {
  console.log(`TaskHub is running on port ${port}`);
});
