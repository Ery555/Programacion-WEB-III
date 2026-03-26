// USANDO PROMESAS
const verificarEdad = (usuario) => {
    return new Promise((resolve, reject) => {
        if (usuario.edad >= 18) {
            resolve(`${usuario.nombre} es mayor de edad`);
        } else {
            reject(`${usuario.nombre} es menor de edad`);
        }
    });
};
console.log('EJEMPLO SOLO CON PROMESA');
verificarEdad({nombre:'Jose',edad:26})
     .then(res => console.log(res))
     .catch(err => console.error(err));


// MIGRACIÓN A ASYNC/AWAIT
async function verifica() {
    try {
        const mensaje = await verificarEdad({nombre:'Jose',edad:26});
        console.log('EJEMPLO MIGRACION A ASYNC/AWAIT');
        console.log(mensaje); 
    } catch (error) {
        console.error(error);
    }
}
verifica();