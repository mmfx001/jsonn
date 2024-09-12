const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4 } = require('uuid');
const cors = require('cors'); // CORS middleware

const app = express();
app.use(express.json()); // For parsing application/json
app.use(cors()); // Enable CORS for all routes

let cards = []; // Temporary in-memory storage
const dbFilePath = path.join(__dirname, 'db.json');

// Load initial cards from db.json
fs.readFile(dbFilePath, 'utf8', (err, data) => {
    if (!err) {
        cards = JSON.parse(data).cards || [];
    } else {
        console.error('Error loading initial data:', err);
    }
});

// Helper function to save cards to db.json
function saveCards() {
    fs.writeFile(dbFilePath, JSON.stringify({ cards }), (err) => {
        if (err) {
            console.error('Error saving cards to file:', err);
        }
    });
}

// GET all cards
app.get('/card', (req, res) => {
    res.status(200).json(cards);
});

// POST new card
app.post('/card', (req, res) => {
    const { nomi, narx, xotira, aloqa, holati, rasmi } = req.body;
    if (!nomi || !narx || !xotira || !aloqa || !holati || !rasmi) {
        return res.status(400).json({ status: 'Bad Request', message: 'Missing required fields' });
    }

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
    saveCards(); // Save cards to db.json
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
app.put('/card/:id', (req, res) => {
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
        saveCards(); // Save updated cards to db.json
        res.status(200).json({ status: 'OK', card: updatedCard });
    } else {
        res.status(404).json({ status: 'Not Found' });
    }
});

// DELETE a card by ID
app.delete('/card/:id', (req, res) => {
    const id = req.params.id;
    const originalLength = cards.length;
    cards = cards.filter(b => b.id !== id);
    if (cards.length < originalLength) {
        saveCards(); // Save updated cards to db.json
        res.status(200).json({ status: 'Deleted' });
    } else {
        res.status(404).json({ status: 'Not Found' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
