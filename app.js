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
        id: users.length + 1, // Assigne un nouvel ID à l'utilisateur basé sur la longueur actuelle du tableau users
        name: req.body.name, // Récupère le nom de l'utilisateur depuis le corps de la requête.
        email: req.body.email // Récupère l'email de l'utilisateur depuis le corps de la requête
    }
    users.push(newUser); // Ajoute le nouvel utilisateur au tableau users. Avec une BDD on aurait une auto incrémentation à chaque ajout d'utilisateur
    res.status(201).json(newUser) // Définit le code de statut HTTP à 201 (Created) et envoie la réponse avec le nouvel utilisateur en format JSON
})

// Route pour modifie un utilisateur 

app.put("/users/:id", (req, res) => { // Création de la route PUT avec un url users/:id (id dynamique)
    const userId = parseInt(req.params.id); // Convertit le paramètre id en nombre entier + récupère le paramètre id de l'URL
    const user = users.find(u => u.id === userId); // Trouve l'utilisateur dans le tableau users dont l'ID correspond à userId
    if (user) { // Vérifie si un utilisateur avec l'ID donné a été trouvé.
        user.name = req.body.name || user.name; // Si req.body.name est défini, met à jour le nom de l'utilisateur. Sinon, conserve l'ancien nom
        user.email = req.body.email || user.email; // pareil
        res.json(user); // Envoie l'utilisateur mis à jour en format JSON
    } else {
        res.status(404).send("Utilisateur non trouvé") // Si l'utilisateur n'est pas trouvé, envoie une réponse avec le code de statut 404 (Not Found) et un message d'erreur
    }
})

// Route pour supprimer un utilisateur 

app.delete("/users/:id", (req, res) => {
    const userId = parseInt(req.params.id);// jusque là pareil que le PUT
    const userIndex = users.findIndex(u => u.id === userId); // Trouve l'index de l'utilisateur dans le tableau users dont l'ID correspond à userId.
    if (userIndex !== -1) { // Vérifie si un utilisateur avec l'ID donné a été trouvé
        const deletedUser = users.splice(userIndex, 1); // Supprime un élément du tableau users à l'index userIndex et renvoie l'utilisateur supprimé.
        res.json(deletedUser); // Envoie l'utilisateur supprimé en format JSON
    } else {
        res.status(404).send('User not found'); // Si l'utilisateur n'est pas trouvé, envoie une réponse avec le code de statut 404 (Not Found) et un message d'erreur.
    }
})

//ANCHOR - SEVEUR

app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});