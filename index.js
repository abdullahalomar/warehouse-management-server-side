const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
app.use(cors());
app.use(express.json());
// For parsing application/x-www-form-urlencoded
// app.use(express.urlencoded({ extended: true }));


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

        // Manage Item
        app.get('/inventoryItem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const inventoryItem = await inventoryItemCollection.findOne(query);
            res.send(inventoryItem);
        });

        // Add New Item
        app.post('/inventoryItem', async (req, res) => {
            const newInventoryItem = req.body;
            console.log(req.body);
            const result = await inventoryItemCollection.insertOne(newInventoryItem);
            res.send(result);
        });

        // Delete to manage item
        app.delete('/inventoryItem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryItemCollection.deleteOne(query);
            res.send(result);
        });

        // My Item
        app.get('/myitem', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = inventoryItemCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/myitem', async (req, res) => {
            const item = req.body;
            const result = await inventoryItemCollection.insertOne(item);
            res.send(result);
        });
        // update the quantity of product
        app.post('/updateQuantity', async (req, res) => {
            const item = req.body;
            const result = await inventoryItemCollection.updateOne({
                _id: '628a27896525fef32983c6fc'
            }, {
                $inc : {quantity: 122}
            });
            res.send(result);
        });
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





