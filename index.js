const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2vmrg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const inventoryItemCollection = client.db('laptopWarehouse').collection('inventoryItem');
        app.get('/inventoryItem', async (req, res) => {
            const query = {};
            const cursor = inventoryItemCollection.find(query);
            const inventoryItems = await cursor.toArray();
            res.send(inventoryItems);
        });

        app.get('/inventoryItem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const inventoryItem = await inventoryItemCollection.findOne(query);
            res.send(inventoryItem);
        });

        //post
        app.post('/inventoryItem', async (req, res) => {
            const newInventoryItem = req.body;
            const result = await inventoryItemCollection.insertOne(newInventoryItem);
            res.send(result);
        })

        //Delete
        app.delete('/inventoryItem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryItemCollection.deleteOne(query);
            res.send(result);
        })

    }
    finally {
        
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Laptop Server')
});

app.listen(port, () => {
    console.log('listening to port', port);
})





