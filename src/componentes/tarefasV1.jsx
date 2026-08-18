// import "./App.css";
import Header from "./Header";
import ListaTarefas from "./ListaTarefas";
import { useState } from "react";

function TarefasV1() {
 const [tarefas, setTarefas] = useState(() => {
  const salvo = localStorage.getItem("TaskFlow.tarefas");
  return salvo ? JSON.parse(salvo) : [];
});

const [proximoId, setProximoId] = useState(() => {
  const salvo = localStorage.getItem("TaskFlow.tarefas");

  if (salvo) {
    const dados = JSON.parse(salvo);
    return dados.length > 0 ? dados[dados.length - 1].id + 1 : 1;
  }

  return 1;
});

  const [texto, setTexto] = useState("");
  const [prioridade, setPrioridade] = useState("media");


  function adicionarTarefa() {
    if (texto.trim() === "") return;

    const nova = {
      id: proximoId,
      texto: texto.trim(),
      concluida: false,
      prioridade: prioridade,
    };

    setTarefas([...tarefas, nova]);
    setProximoId(proximoId + 1);
    setTexto("");
    setPrioridade("media");
  }

  function deletarTarefa(id) {
    setTarefas(tarefas.filter((tarefa) => tarefa.id !== id));
  }

  function concluirTarefa(id) {
    setTarefas(
      tarefas.map((tarefa) =>
        tarefa.id === id
          ? { ...tarefa, concluida: !tarefa.concluida }
          : tarefa
      )
    );


  }

  // const tarefasFiltradas = tarefas.filter((tarefa) => {
  //   if(filtro === "pendentes") {
  //     return !tarefa.concluida;
  //   }

  //   if(filtro === "concluidas") {
  //     return tarefa.concluida;
  //   }

  //   return true;
  // });

  return (
    <div className="conteiner" id="app">
      <Header
        titulo="TaskFlow"
        subtitulo="Gerencie suas tarefas"
      />

      <main className="conteiner">
        <section id="formulario">
          <input
            id="input-tarefa"
            type="text"
            placeholder="Nova tarefa..."
            autoComplete="off"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adicionarTarefa()}
          />

          <select
            id="sel-prioridade"
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value)}
          >
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>

          <button
            className="btn-adicionar"
            type="button"
            onClick={adicionarTarefa}
          >
            Adicionar
          </button>
        </section>
        
          <div id="contadores">
            <span id="cont-total">
              {tarefas.length} tarefas
            </span>

            <span id="cont-pendentes">
              {tarefas.filter((t) => !t.concluida).length} pendentes
            </span>

            <span id="cont-concluidas">
              {tarefas.filter((t) => t.concluida).length} concluídas
            </span>
          </div>
       

        <ListaTarefas
          tarefas={tarefasFiltradas}
          onDeletar={deletarTarefa}
          onConcluir={concluirTarefa}
        />
      </main>

      <footer>
        <p>TaskFlow 2026 - Prof. Alan Glei</p>
      </footer>
    </div>
  );
}

export default TarefasV1;