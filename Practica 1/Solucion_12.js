//EJEMPLO CON CALLBACKS
console.log('EJEMPLO CON CALLBACKS');

function cargarArchivo(callback) {
  setTimeout(() => {
    console.log("1. Archivo cargado");
    callback("Contenido");
  }, 1000);
}

function procesarArchivo(contenido, callback) {
  setTimeout(() => {
    console.log("2. Archivo procesado");
    callback(contenido + " editado");
  }, 2000);
}

cargarArchivo((res1) => {
  procesarArchivo(res1, (res2) => {
    console.log("3. Resultado final: " + res2);
  });
});

//EJEMPLO CON ASYNC/AWAIT

const cargar = () => new Promise(
    res => setTimeout(
        () => res("Contenido"), 4000));
const procesar = (c) => new Promise(
    res => setTimeout(
        () => res(c + " editado"), 5000));

async function ejecutarProceso() {
    console.log('EJEMPLO CON ASYNC/AWAIT');
    const contenido = await cargar();
    console.log("1. Archivo cargado");
  
    const resultado = await procesar(contenido);
    console.log("2. Archivo procesado");
  
    console.log("3. Resultado final: " + resultado);
}
function ejecutar(){
    setTimeout(() => {
        ejecutarProceso();    
    }, 5000);
    
}
ejecutar();