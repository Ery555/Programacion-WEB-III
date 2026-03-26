// Ejemplo de Encadenamiento de Promesas
const paso1 = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Paso 1 completado");
      resolve("Datos del Paso 1");
    }, 2000);
  });
};

const paso2 = (pasoAnterior) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Paso 2 completado usando:", pasoAnterior);
      resolve("Resultado Final");
    }, 3000);
  });
};

paso1()
  .then((resultado1) => {
    return paso2(resultado1);
  })
  .then((resultadoFinal) => {
    console.log("Proceso terminado:", resultadoFinal);
  });