function miFuncion(palabra) {
    let resultado={}
    for (let letra of palabra) {
        if (resultado[letra]) {
            resultado[letra]++;
        }
        else{
            resultado[letra]=1;
        }
    }
    return resultado;
};
let obj=miFuncion("casa");
console.log(obj);
