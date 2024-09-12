const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4 } = require('uuid');
const getCard = require('./util');

const app = express();
app.use(express.json()); // For parsing application/json

let cards = []; // Temporary in-memory storage
const dbFilePath = path.join(__dirname, 'db.json');

// Load initial cards from db.json
fs.readFile(dbFilePath, 'utf8', (err, data) => {
    if (!err) {
        cards = JSON.parse(data).cards || [];
    }
});

// GET all cards
app.get('/card', (req, res) => {
    res.status(200).json(cards);
});

// POST new card
app.post('/card', async (req, res) => {
    const { nomi, narx, xotira, aloqa, holati, rasmi } = req.body;
    const newCard = {
        id: v4(),
        nomi,
        narx,
        xotira,
        aloqa,
        holati,
        rasmi
    };
    cards.push(newCard);
    
    // Optionally: Save cards to db.json
    fs.writeFile(dbFilePath, JSON.stringify({ cards }), (err) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
    });

    res.status(201).json({ status: 'Created', card: newCard });
});

// GET a card by ID
app.get('/card/:id', (req, res) => {
    const id = req.params.id;
    const card = cards.find(b => b.id === id);
    
    if (card) {
        res.status(200).json({ status: 'OK', card });
    } else {
        res.status(404).json({ status: 'Not Found' });
    }
});

// PUT update a card by ID
app.put('/card/:id', async (req, res) => {
    const id = req.params.id;
    const { nomi, narx, xotira, aloqa, holati, rasmi } = req.body;
    const idx = cards.findIndex(b => b.id === id);

    if (idx !== -1) {
        const updatedCard = {
            id: cards[idx].id,
            nomi: nomi || cards[idx].nomi,
            narx: narx || cards[idx].narx,
            xotira: xotira || cards[idx].xotira,
            aloqa: aloqa || cards[idx].aloqa,
            holati: holati || cards[idx].holati,
            rasmi: rasmi || cards[idx].rasmi
        };
        cards[idx] = updatedCard;

        // Optionally: Save updated cards to db.json
        fs.writeFile(dbFilePath, JSON.stringify({ cards }), (err) => {
            if (err) {
                return res.status(500).send('Internal Server Error');
            }
        });

        res.status(200).json({ status: 'OK', card: updatedCard });
    } else {
        res.status(404).json({ status: 'Not Found' });
    }
});

// DELETE a card by ID
app.delete('/card/:id', (req, res) => {
    const id = req.params.id;
    cards = cards.filter(b => b.id !== id);

    // Optionally: Save updated cards to db.json
    fs.writeFile(dbFilePath, JSON.stringify({ cards }), (err) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
    });

    res.status(200).json({ status: 'Deleted' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
