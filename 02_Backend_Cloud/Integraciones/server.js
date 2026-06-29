require("dotenv").config();
const express = require("express");
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const app = express();   // ← aquí defines app
const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("🚀 Backend IAM Zero Trust funcionando...");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
