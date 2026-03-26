const promesaExito = new Promise((resolve) => {
    setTimeout(() => {
        resolve('Exito');
    }, 3000);
})

promesaExito.then((mensaje)=> console.log(mensaje));