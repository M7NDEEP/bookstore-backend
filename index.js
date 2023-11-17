const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const BASE_URL = process.env.BASE_URL

// Load environment variables from .env file
require('dotenv').config();

// MIDDLEWARE:
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// MONGODB CONNECTION:
const uri = process.env.MONGODB_URI;


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

        // Create a Collection of books in the "BookInventory" database
        const bookCollection = client.db("BookInventory").collection("books");

        // GET: Getting the Book data from the database (writebyme)
        app.get("/all-books", async (req, res) => {
            try {
                let query = {};

                // Log the value of req.query.genre
                console.log("Genre from query parameter:", req.query.genre);

                // Check if a genre is specified in the query parameters
                if (req.query.genre) {
                    query = { genre: req.query.genre };
                }

                // Log the generated query
                console.log("Generated query:", query);

                // Find books based on the query and send the result
                const books = await bookCollection.find(query).toArray();
                res.send(books);
            } catch (error) {
                console.log(error);
                res.status(500).send("Internal Server Error");
            }
        });

        // GET: Getting the single Book data from the database (writebyme)
        app.get("/single-book/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const book = await bookCollection.findOne({ _id: new ObjectId(id) });

                if (!book) {
                    return res.status(404).json({ error: 'Book not found' });
                }

                res.json(book);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        // GET: Getting books specific to a user (writebyme)
        app.get("/user-books/:uid", async (req, res) => {
            try {
                const uid = req.params.uid;
                const userBooks = await bookCollection.find({ userId: uid }).toArray();
                res.json(userBooks);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        // ...

        // POST: Inserting a book to the database (writebyme)
        app.post("/uploadbook", async (req, res) => {
            try {
                const data = req.body;
                const result = await bookCollection.insertOne(data);
                res.send(result);
            } catch (error) {
                console.log(error);
                res.status(500).send("Internal Server Error");
            }
        });

        // PATCH: Updating book data (writebyme)
        app.patch("/update-book/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const updateBookData = req.body;
                const filter = { _id: new ObjectId(id) };
                const options = { upsert: true };

                const updatebook = {
                    $set: {
                        ...updateBookData
                    }
                };
                // Update
                const result = await bookCollection.updateOne(filter, updatebook, options);
                res.send(result);
            } catch (error) {
                console.log(error);
                res.status(500).send("Internal Server Error");
            }
        });

        // DELETE: Deleting the book (writebyme)
        app.delete("/delete-book/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const options = { upsert: true };
                // Delete
                const result = await bookCollection.deleteOne(filter, options);
                res.send("Deleted Successfully");
            } catch (error) {
                console.log(error);
                res.status(500).send("Internal Server Error");
            }
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});