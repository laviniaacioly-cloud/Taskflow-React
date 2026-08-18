import { useEffect, useState } from "react";
import Header from "./Header";
import axios from "axios";

import ModalTarefa from "./ModalTarefa";
import ListaTarefas from "./ListaTarefas";

function Kanban() {
  // ==========================================
  // TAREFAS
  // ==========================================

  const [tarefas, setTarefas] = useState(() => {
    const salvo = localStorage.getItem("TaskFlow.tarefas");

    return salvo ? JSON.parse(salvo) : [];
  });

  // ==========================================
  // MODAL
  // ==========================================

  const [modalAberto, setModalAberto] = useState(false);

  const [tarefaEditando, setTarefaEditando] = useState(null);

  const [colunaAtiva, setColunaAtiva] = useState("afazer");

  // ==========================================
  // FORMULÁRIO
  // ==========================================

  const [texto, setTexto] = useState("");

  const [prioridade, setPrioridade] = useState("media");

  // ==========================================
  // CEP
  // ==========================================

  const [cep, setCep] = useState("");

  const [cidade, setCidade] = useState("");

  const [buscandoCep, setBuscandoCep] = useState(false);

  const [erroCep, setErroCep] = useState("");

  // ==========================================
  // FILTRO
  // ==========================================

  const [filtroPrioridade, setFiltroPrioridade] = useState("todas");

  // ==========================================
  // SALVAR NO LOCALSTORAGE
  // ==========================================

  useEffect(() => {
    localStorage.setItem("TaskFlow.tarefas", JSON.stringify(tarefas));
  }, [tarefas]);

  // ==========================================
  // TÍTULO DA ABA
  // ==========================================

  useEffect(() => {
    const quantidadeAFazer = tarefas.filter(
      (tarefa) => tarefa.coluna === "afazer" || tarefa.coluna === "andamento",
    ).length;

    if (quantidadeAFazer > 0) {
      document.title = `(${quantidadeAFazer}) TaskFlow`;
    } else {
      document.title = "TaskFlow";
    }

    return () => {
      document.title = "TaskFlow";
    };
  }, [tarefas]);

  // ==========================================
  // ABRIR MODAL PARA CRIAR
  // ==========================================

  function abrirModalCriar(coluna) {
    setTarefaEditando(null);

    setColunaAtiva(coluna);

    setModalAberto(true);
  }

  // ==========================================
  // ABRIR MODAL PARA EDITAR
  // ==========================================

  function abrirModalEditar(tarefa) {
    setTarefaEditando(tarefa);

    setColunaAtiva(tarefa.coluna);

    setModalAberto(true);
  }

  // ==========================================
  // SALVAR TAREFA DO MODAL
  // ==========================================

  function salvarTarefa(dados) {
    if (dados.id) {
      // EDITAR
      setTarefas(
        tarefas.map((tarefa) =>
          tarefa.id === dados.id
            ? {
                ...tarefa,
                ...dados,
              }
            : tarefa,
        ),
      );
    } else {
      // CRIAR
      setTarefas([
        ...tarefas,
        {
          ...dados,
          id: Date.now(),
          concluida: dados.coluna === "concluido",
        },
      ]);
    }

    setModalAberto(false);

    setTarefaEditando(null);
  }

  // ==========================================
  // EXCLUIR TAREFA
  // ==========================================

  function deletarTarefa(id) {
    const confirmado = window.confirm(
      "Tem certeza que deseja deletar esta tarefa?",
    );

    if (!confirmado) return;

    setTarefas(tarefas.filter((tarefa) => tarefa.id !== id));
  }

  // ==========================================
  // CONCLUIR TAREFA
  // ==========================================

  function concluirTarefa(id) {
    setTarefas(
      tarefas.map((tarefa) =>
        tarefa.id === id
          ? {
              ...tarefa,
              concluida: !tarefa.concluida,
            }
          : tarefa,
      ),
    );
  }

  // ==========================================
  // MOVER TAREFA
  // ==========================================

  function moverTarefa(id, novaColuna) {
    setTarefas(
      tarefas.map((tarefa) =>
        tarefa.id === id
          ? {
              ...tarefa,
              coluna: novaColuna,
              concluida: novaColuna === "concluido",
            }
          : tarefa,
      ),
    );
  }

  // ==========================================
  // ADICIONAR PELO FORMULÁRIO ANTIGO
  // ==========================================

  function adicionarTarefa() {
    if (texto.trim() === "") return;

    const novaTarefa = {
      id: Date.now(),
      texto: texto.trim(),
      cep,
      cidade,
      prioridade,
      coluna: "afazer",
      concluida: false,
    };

    setTarefas([...tarefas, novaTarefa]);

    setTexto("");
    setCep("");
    setCidade("");
    setPrioridade("media");
    setErroCep("");
  }

  // ==========================================
  // CONSULTAR CEP
  // ==========================================

  async function buscarCep(cepDigitado) {
    const cepLimpo = cepDigitado.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      setCidade("");
      setErroCep("");
      return;
    }

    setBuscandoCep(true);
    setErroCep("");

    try {
      const resposta = await axios.get(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );

      const data = resposta.data;

      if (data.erro) {
        throw new Error("CEP não encontrado");
      }

      setCidade(`${data.localidade}/${data.uf}`);
    } catch {
      setCidade("");

      setErroCep("CEP inválido ou não encontrado");
    } finally {
      setBuscandoCep(false);
    }
  }

  // ==========================================
  // FILTRO
  // ==========================================

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtroPrioridade === "todas") {
      return true;
    }

    return tarefa.prioridade === filtroPrioridade;
  });

  // ==========================================
  // CONTADORES
  // ==========================================

  const totalTarefas = tarefas.length;

  const tarefasPendentes = tarefas.filter(
    (tarefa) => tarefa.coluna !== "concluido",
  ).length;

  const tarefasConcluidas = tarefas.filter(
    (tarefa) => tarefa.coluna === "concluido",
  ).length;

  const quantidadeAFazer = tarefas.filter(
    (tarefa) => tarefa.coluna === "afazer",
  ).length;

  const quantidadeAndamento = tarefas.filter(
    (tarefa) => tarefa.coluna === "andamento",
  ).length;

  const quantidadeConcluido = tarefas.filter(
    (tarefa) => tarefa.coluna === "concluido",
  ).length;

  // ==========================================
  // JSX
  // ==========================================

  return (
    <div className="conteiner">
      <Header titulo="TaskFlow" subtitulo="Gerencie suas tarefas" />

      <main>
        {/* ==================================
            CONTADORES
        ================================== */}

        {/* <section id="contadores">
          <span>Total: {totalTarefas}</span>

          <span>Pendentes: {tarefasPendentes}</span>

          <span>Concluídas: {tarefasConcluidas}</span>
        </section> */}

        <div className="filtro-prioridade">
          <label>Filtrar por prioridade:</label>
          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
          >
            <option value="todas">Todas</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>

        {/* ==================================
            KANBAN
        ================================== */}

        <section className="kanban">
          {/* ==================================
              A FAZER
          ================================== */}

          <div className="kanban-coluna">
            <div className="kanban-coluna-header">
              <h3>A Fazer</h3>        

              <div className="kanban-header-acoes">
                <span className="kanban-contador">{quantidadeAFazer}</span>

                <button
                  className="kanban-btn-add"
                  onClick={() => abrirModalCriar("afazer")}
                >
                  +
                </button>
              </div>
            </div>

            <ListaTarefas
              tarefas={tarefasFiltradas.filter(
                (tarefa) => tarefa.coluna === "afazer",
              )}
              onDeletar={deletarTarefa}
              onConcluir={concluirTarefa}
              onEditar={abrirModalEditar}
              onMover={moverTarefa}
              colunaAnterior={null}
              colunaProxima="andamento"
            />
          </div>

          {/* ==================================
              EM ANDAMENTO
          ================================== */}

          <div className="kanban-coluna">
            <div className="kanban-coluna-header">
              <h3>Em Andamento</h3>

              <div className="kanban-header-acoes">
                <span className="kanban-contador">
                  {
                    tarefas.filter((tarefa) => tarefa.coluna === "afazer")
                      .length
                  }
                </span>

                <button
                  className="kanban-btn-add"
                  onClick={() => abrirModalCriar("andamento")}
                >
                  +
                </button>
              </div>
            </div>

            <ListaTarefas
              tarefas={tarefasFiltradas.filter(
                (tarefa) => tarefa.coluna === "andamento",
              )}
              onDeletar={deletarTarefa}
              onConcluir={concluirTarefa}
              onEditar={abrirModalEditar}
              onMover={moverTarefa}
              colunaAnterior="afazer"
              colunaProxima="concluido"
            />
          </div>

          {/* ==================================
              CONCLUÍDO
          ================================== */}

          <div className="kanban-coluna">
            <div className="kanban-coluna-header">
              <h3>Concluído</h3>

              <div className="kanban-header-acoes">
                <span className="kanban-contador">{quantidadeConcluido}</span>

                <button
                  className="kanban-btn-add"
                  onClick={() => abrirModalCriar("concluido")}
                >
                  +
                </button>
              </div>
            </div>

            <ListaTarefas
              tarefas={tarefasFiltradas.filter(
                (tarefa) => tarefa.coluna === "concluido",
              )}
              onDeletar={deletarTarefa}
              onConcluir={concluirTarefa}
              onEditar={abrirModalEditar}
              onMover={moverTarefa}
              colunaAnterior="andamento"
              colunaProxima={null}
            />
          </div>
        </section>
      </main>

      {/* ==================================
          MODAL
      ================================== */}

      <ModalTarefa
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onSalvar={salvarTarefa}
        tarefa={tarefaEditando}
        coluna={colunaAtiva}
      />

      {/* ==================================
          RODAPÉ
      ================================== */}

      <footer>
        <p>TaskFlow 2026 - Prof. Alan Glei</p>
      </footer>
    </div>
  );
}

export default Kanban;
