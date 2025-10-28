require('dotenv').config();

const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.REACT_APP_FE_PORT || 443;

// Configuração do servidor React
app.use(express.static(path.join(__dirname, "build")));

// Middleware para fornecer arquivos CSS e JS
app.use(
  "/css",
  express.static(path.join(__dirname, "./public/css"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

app.use(
  "/js",
  express.static(path.join(__dirname, "./public/js"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "text/javascript");
      }
    },
  })
);

// Mapeamento das rotas para o index.html
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Carrega os certificados PEM
const options = {
  key: fs.readFileSync("./certificates/private.key"),
  cert: fs.readFileSync("./certificates/public.pem"),
  ca: fs.readFileSync("./certificates/intermediateCA.pem"),
};

// Cria o servidor HTTPS
https.createServer(options, app).listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
