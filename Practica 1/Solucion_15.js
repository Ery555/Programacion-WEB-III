function verificarEdad(edad, callback) {
  setTimeout(() => {
    if (edad === 20) {
      callback(null, { edad:20, nombre: "Erick" });
    } else {
      callback("Error: Edad no Coincide", null);
    }
  }, 1000);
}

// Callback a Promesa
const verificaPromesa = (edad) => {
  return new Promise((resolve, reject) => {
    verificarEdad(edad, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
};

verificaPromesa(20)
  .then((usuario) => console.log("Edad Verificada:", usuario.nombre,usuario.edad))
  .catch((error) => console.error(error));