const express = require("express");
const app = express(); // 👈 AQUÍ estaba el error

app.use(express.static("public"));

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});