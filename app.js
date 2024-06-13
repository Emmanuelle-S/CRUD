// ANCHOR - INITIALISATION

// pour initialiser le projet et installer express : 
// npm init y
// npm install express -- rappel : express = librairie qui se met par dessus Node pour créer des applications back + offre un package de solution qui permet d'écrire moins de code.

const express = require("express") // permet d'importer express
const app = express() // crée une instance de l'application Express.
const port = 3000 // permet de définir notre port

app.use(express.json()) // .use = méthode de la librairie express, permet de parser (analyser) le corps des requêtes HTTP qui sont au format json => va convertir les données en un objet JS accessible via req.body


let users = [ // on crée un tableau d'utilisateur avec 2 exemples
    { id: 1, name: 'Louis', email: 'louis@example.com' },
    { id: 2, name: 'Lucas', email: 'lucas@example.com' }
    ]

// ANCHOR ROUTES

// Route pour récupérer les utilisateurs 

app.get("/users", (req, res) => {
    res.json(users);
})

// Route pour créer un utilisateur 

app.post("/users", (req, res) => { // création d'une route pour les requêtes HTTP POST avec un URL /users
    const newUser = {
        id: users.length + 1,
        name: req.body.name,
        email: req.body.email
    }
    users.push(newUser);
    res.status(201).json(newUser)
})

// Route pour modifie un utilisateur 

app.put("/users/:id", (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        res.json(user);
    } else {
        res.status(404).send("Utilisateur non trouvé")
    }
})

// Route pour supprimer un utilisateur 

app.delete("/users/:id", (req, res) => {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        const deletedUser = users.splice(userIndex, 1);
        res.json(deletedUser);
    } else {
        res.status(404).send('User not found');
    }
})

//ANCHOR - SEVEUR

app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});