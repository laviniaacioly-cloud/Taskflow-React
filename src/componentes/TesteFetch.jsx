// import "./App.css";

function TesteFetch() {

    const minhaPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            const operacaoDeuCerto = true;
            if (operacaoDeuCerto) {
                resolve("Dados chegaream!");
            } else {
                reject("Algo deu errado...");
            }
        }, 2000);
    });

function execPromise() {
    const minhaPromise = new Promise ((resolve, reject) => {
        setTimeout(() => {
            const operacaoDeuCerto = true;
            if (operacaoDeuCerto) {
                resolve ("Dados chegaram!");
            } else {
                reject ("Algo deu errado...");
            }
        }, 5000);
    });
    minhaPromise.then((mensagem) => {
        console.log("Sucesso:", mensagem);
    })
    .catch((erro) =>{
        console.error("Erro:", erro);
    });
    console.log("Promise criada, aguardando resultado...");
}

async function buscarUsuario(id) {
    try {
        const resposta = await fetch(
            'https://jsonplaceholder.typicode.com/users/' + id
        );
        const usuario = await resposta.json();
        console.log(usuario)
        console.log ('Nome:', usuario.name);
        return usuario
    } catch (erro) {
        console.log ("Erro:", erro.mensagem);
        return null
    } finally {
        console.log('finalizado');
    }
}
buscarUsuario(1);

  return (
   <div>
    <button
        onClick = {() => {
            minhaPromise.then((mensagem) => {
                console.log("Sucesso: ", mensagem);
            })
            .catch((erro) => {
                console.error("Erro:", erro);
            });
            console.log ("Promise criada, aguardando resultado...");
        }}
        >
        Testar Promise
    </button>
    <button onClick={execPromise}>Testar Promise</button>
   </div>
  );
}
export default TesteFetch;