function miFuncion(callback){
    console.log("Primero")
    callback
}
function segundo(){
    setTimeout(() => {
        console.log("Segundo");
    }, 2000);
}

miFuncion(segundo());