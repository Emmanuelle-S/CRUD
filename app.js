// ANCHOR - INITIALISATION

// pour initialiser le projet et installer express : 
// npm init y
// npm install express -- rappel : express = librairie qui se met par dessus Node pour créer des applications back + offre un package de solution qui permet d'écrire moins de code.
// npm i argon2 pour installer Argon2 (hachage de password)
// npm install jsonwebtoken dotenv -> permet d'installer les bibliothèques jsonwebtoken et dotenv

// + création d'un fichier .env pour stocker la clé secrete du token

require('dotenv').config(); // charge les variables définies dans le fichier .env

const express = require("express") // permet d'importer la lib express
const argon2 = require("argon2") // permet d'importer la lib argon2
const app = express() // crée une instance de l'application Express.
const port = 3000 // permet de définir notre port
const jwt = require("jsonwebtoken"); // permet d'importer la librairie jsonwebtoken

app.use(express.json()) // .use = méthode de la librairie express, permet de parser (analyser) le corps des requêtes HTTP qui sont au format json => va convertir les données en un objet JS accessible via req.body

let users = [ // on crée un tableau d'utilisateur avec 2 exemples
    { id: 1, name: 'Louis', email: 'louis@example.com', password: "123" },
    { id: 2, name: 'Lucas', email: 'lucas@example.com', password: "456" }
    ]

// Middleware de vérification du token
const authenticateToken = (req, res, next) => {
    // Déclare une fonction de middleware appelée authenticateToken qui prend trois paramètres : req (la requête), res (la réponse) et next (une fonction qui passe au middleware suivant)
    const authHeader = req.headers['authorization'];
    // Extrait le champ authorization des en-têtes de la requête HTTP -> contient le token JWT.
    const token = authHeader && authHeader.split(' ')[1];
    // Vérifie si authHeader existe (s'il contient une valeur).
    // Si authHeader existe, il est divisé en un tableau de chaînes de caractères en utilisant un espace comme délimiteur (split(' ')).
    // Le token réel est extrait comme le second élément du tableau ([1])
    // Le token est généralement envoyé sous forme de "Bearer <token>"

    if (!token) return res.sendStatus(401); // Si aucun token n'est présent, renvoie une réponse 401 (Non autorisé)

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        // Utilise la méthode verify de la bibliothèque jsonwebtoken pour vérifier et décoder le token JWT.
        // process.env.JWT_SECRET est la clé secrète utilisée pour signer et vérifier le token -> stockée dans le .env
        // + fonction callback pour gérer le résultat de la vérification -> prend deux arguments : err (erreur) et user
        if (err) return res.sendStatus(403); // Si le token est invalide, renvoie une réponse 403 (Interdit)
        req.user = user; 
        // Si le token est valide, les informations décodées de l'utilisateur (user) sont ajoutées à l'objet de la requête (req) -> permet aux routes d'accéder aux informations de l'utilisateur.
        next(); // Appelle le middleware suivant
    });
};

// ANCHOR ROUTES

// Route pour récupérer les utilisateurs
app.get("/users", authenticateToken, (req, res) => {
    res.json(users);
})

// Route pour créer un utilisateur
app.post("/users", async (req, res) => { // création d'une route pour les requêtes HTTP POST avec un URL /users. On a rajouté async devant (req...) car l'utilisation d'argon2 pour le hashage doit gérer des opérations asynchrone
    try {
        const hashedPassword = await argon2.hash(req.body.password); // hachage du mdp

        const newUser = {
            id: users.length + 1, // Assigne un nouvel ID à l'utilisateur basé sur la longueur actuelle du tableau users
            name: req.body.name, // Récupère le nom de l'utilisateur depuis le corps de la requête.
            email: req.body.email, // Récupère l'email de l'utilisateur depuis le corps de la requête
            password: hashedPassword
        }
        users.push(newUser); // Ajoute le nouvel utilisateur au tableau users. Avec une BDD on aurait une auto incrémentation à chaque ajout d'utilisateur

        const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ user: newUser, token: token }) // Définit le code de statut HTTP à 201 (Created) et envoie la réponse avec le nouvel utilisateur en format JSON
    } catch (err) {
        res.status(500).send('Erreur lors du hachage du mot de passe'); // Envoie une réponse d'erreur en cas de problème avec le hachage
    }
})

// Route pour modifie un utilisateur
app.put("/users/:id", authenticateToken, (req, res) => { // Création de la route PUT avec un url users/:id (id dynamique)
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
app.delete("/users/:id", authenticateToken, (req, res) => {
    const userId = parseInt(req.params.id);// jusque là pareil que le PUT
    const userIndex = users.findIndex(u => u.id === userId); // Trouve l'index de l'utilisateur dans le tableau users dont l'ID correspond à userId.
    if (userIndex !== -1) { // Vérifie si un utilisateur avec l'ID donné a été trouvé
        const deletedUser = users.splice(userIndex, 1); // Supprime un élément du tableau users à l'index userIndex et renvoie l'utilisateur supprimé.
        res.json(deletedUser); // Envoie l'utilisateur supprimé en format JSON
    } else {
        res.status(404).send('User not found'); // Si l'utilisateur n'est pas trouvé, envoie une réponse avec le code de statut 404 (Not Found) et un message d'erreur.
    }
})

// ANCHOR - SEVEUR
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
