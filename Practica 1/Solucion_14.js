// Promesa
const obtenerSaludo = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("¡Hola desde la Promesa!");
    }, 1000);
  });
};

function saludoConCallback(callback) {
  obtenerSaludo()
    .then((resultado) => {
      callback(null, resultado);
    })
    .catch((error) => {
      callback(error, null);
    });
}

// Ejecucion del Callback
saludoConCallback((err, res) => {
  if (err) {
    console.error("Error:", err);
    return;
  }
  console.log("Resultado:", res);
});