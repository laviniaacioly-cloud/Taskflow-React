import axios from "axios";
import { useState } from "react";

function ViaCEP() {
  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState("");

  async function buscarCep(cepDigitado) {
    const cepLimpo = cepDigitado.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      setCidade("");
      setErroCep("Digite um CEP válido.");
      return;
    }

    setBuscandoCep(true);
    setErroCep("");

    try {
      const resposta = await axios.get(
        "https://viacep.com.br/ws/" + cepLimpo + "/json/"
      );

      console.log("Response", resposta);
      console.log("Response Data", resposta.data);
      console.log("Status", resposta.status);

      const data = resposta.data;

      if (data.erro) {
        throw new Error("CEP não encontrado");
      }

      setCidade(data.localidade + "/" + data.uf);

      console.log("Cidade:", data.localidade);
      console.log("UF:", data.uf);
      console.log("Logradouro:", data.logradouro);
      console.log("Bairro:", data.bairro);
    } catch {
      setErroCep("CEP inválido ou não encontrado");
      setCidade("");
    } finally {
      setBuscandoCep(false);
    }
  }

  return (
    <div>
      <h2>Consultar CEP</h2>

      <input
        type="text"
        value={cep}
        placeholder="Digite o CEP"
        onChange={(e) => setCep(e.target.value)}
      />

      <button onClick={() => buscarCep(cep)}>
        Consultar CEP
      </button>

      {buscandoCep && <p>Buscando CEP...</p>}
      {cidade && <p>{cidade}</p>}
      {erroCep && <p>{erroCep}</p>}
    </div>
  );
}

export default ViaCEP;