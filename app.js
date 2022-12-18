
const express = require("express");
const path = require("path");

// gestion sécurité
const mongoSanitize = require("express-mongo-sanitize");
const toobusy = require("toobusy-js");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const dotenv = require("dotenv").config('./.env');

// Morgan est un middleware au niveau des requests HTTP
const morgan = require("morgan");

// Connexion database MongoDB
const mongoose = require("./db/db");

// Routes
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");

// Utilisation d'express
const app = express();

// Utilisation de morgan
app.use(morgan("dev"));

//  CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Parsing req avec Express
app.use(express.json({limit: "1mb"}));

// helmet pour securité des headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Si server trop occupé
app.use(function(req,res,next) {
  if(toobusy()) {
    res.status(503).json({ message: "I'm busy right now, sorry."});
  } else {
    next();
  }
});

// Limite les requests pendant un instant
const limiter = rateLimit({
  windowMS: 15 * 60 * 1000, //15 minutes
  max: 100, // Limit each IP to 100 requests per "window"
  standardHeaders: true,
  legacyHeaders: false,
})

// contre les injections NoSql
app.use(mongoSanitize());
app.use(limiter);

// Utilisation des routes
app.use('/images/images-profils', express.static(path.join(__dirname, 'images/images-profils')))
app.use('/images/images-posts', express.static(path.join(__dirname, 'images/images-posts')))
app.use('/images', express.static(path.join(__dirname, 'images')))


app.use("/api/auth", userRoutes);
app.use("/api/post", postRoutes);


module.exports = app;
