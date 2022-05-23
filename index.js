const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
app.use(cors());
app.use(express.json());

function verifyJWT (req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbiden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}

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

        // Auth Token
        app.post('/login', async (req, res) => {
            const user = req.body;
            const Token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '2d'
            });
            res.send({Token})
        })

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
        app.get('/myitem', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = inventoryItemCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            }
            else {
                res.status(403).send({ message: 'forbiden access' });
            }
        });

        app.post('/myitem', async (req, res) => {
            const item = req.body;
            const result = await inventoryItemCollection.insertOne(item);
            res.send(result);
        });

        // increase quantity of product
        app.post('/updateQuantity/:id', async (req, res) => {
            const id = req.params.id;
            const item = req.body;
            const result = await inventoryItemCollection.updateOne({
                _id: ObjectId(id)
            }, {
                $inc : {quantity: +item.quantity}
            });
            res.send(result);
        });

        // decrease quantity of product
        app.post('/decreaseQuantity/:id', async (req, res) => {
            const id = req.params.id;
            const result = await inventoryItemCollection.updateOne({
                _id: ObjectId(id)
            }, {
                $inc : {quantity: -1}
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

app.get('/hero', (req, res) => {
    res.send('Hero meets heroku');
})

app.listen(port, () => {
    console.log('listening to port', port);
})





