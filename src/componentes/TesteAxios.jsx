import axios from "axios";


function TesteAxios(){
    async function exemplo() {
        try {
            const resposta = await axios.get(
                'https://jsonplaceholder.typicode.com/users/1'
            );
            
            console.log('Response', resposta);
            console.log('Response Data', resposta.data);
            console.log(resposta.data.name); // 'Leanne Graham'
            console.log(resposta.data.email);
            console.log(resposta.status); // 200

         } catch (erro) {
           console.log(erro.message);
        }
    }
        
    return(
       <button onClick={exemplo}>Teste Axios</button>
    
    );
}   

export default TesteAxios;