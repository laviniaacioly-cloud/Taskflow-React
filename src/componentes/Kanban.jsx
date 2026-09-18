//ok!!!
import { useEffect, useState } from "react";
import Header from "./Header";
import api from "../api";
import ModalTarefa from "./ModalTarefa";
import ListaTarefas from "./ListaTarefas";

function Kanban() {
  // ==========================================
  // TAREFAS, CARREGAMENTO E ERROS
  // ==========================================

  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // ==========================================
  // MODAL
  // ==========================================

  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState(null);
  const [colunaAtiva, setColunaAtiva] = useState("afazer");

  // ==========================================
  // FORMULÁRIO
  // ==========================================

  // const [prioridade, setPrioridade] = useState("media");

  // // ==========================================
  // // CEP
  // // ==========================================

  // const [texto, setTexto] = useState("");
  // const [cep, setCep] = useState("");
  // const [cidade, setCidade] = useState("");
  // const [buscandoCep, setBuscandoCep] = useState(false);
  // const [erroCep, setErroCep] = useState("");

  // ==========================================
  // FILTRO
  // ==========================================

  const [filtroPrioridade, setFiltroPrioridade] = useState("todas");

  // ==========================================
  // CARREGAR TAREFAS API
  // ==========================================

  useEffect(() => {
    async function carregarTarefas() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await api.get("/tarefas");
        setTarefas(resposta.data);
      } catch (e) {
        setErro("Erro ao carregar tarefas. Verifique a conexão.");
        console.error(e);
      } finally {
        setCarregando(false);
      }
    }
    carregarTarefas();
  }, []);

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
    // setColunaAtiva(tarefa.coluna);
    setModalAberto(true);
  }

  // ==========================================
  // SALVAR TAREFA DO MODAL -editar tarefa
  // ==========================================
  async function salvarTarefa(dados) {
    if (dados.id === undefined) {
      try {
        // EDITAR — PUT
        const resposta = await api.post(`/tarefas`, dados);
        setTarefas([...tarefas, resposta.data]);
      } catch (err) {
        setErro("Erro ao salvar tarefa. Tente novamente.");
      }
    } else {
      try {
        const resposta = await api.put(`/tarefas/${dados.id}`, dados);
        setTarefas(tarefas.map((t) => (t.id === dados.id ? resposta.data : t)));
      } catch (err) {
        setErro("Erro ao editar tarefa");
      }
    }
  }
  // ==========================================
  // EXCLUIR TAREFA
  // ==========================================

  async function deletarTarefa(id) {
    try {
      await api.delete(`/tarefas/${id}`);
      setTarefas(tarefas.filter((t) => t.id !== id));
    } catch (err) {
      setErro("Erro ao deletar tarefa.");
    }
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

  async function moverTarefa(id, novaColuna) {
    try {
      const tarefa = tarefas.find((t) => t.id === id);

      if (!tarefa) return;

      const resposta = await api.put(`/tarefas/${id}`, {
        texto: tarefa.texto,
        prioridade: tarefa.prioridade,
        concluida: tarefa.concluida,
        coluna: novaColuna,
      });
      // const resposta = await api.put(
      //    `/tarefas/${id}`,
      //   { coluna: novaColuna }
      // );

      setTarefas(tarefas.map((t) => (t.id === id ? resposta.data : t)));
    } catch (err) {
      setErro("Erro ao mover tarefa. Tente novamente.");
    }
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
        {carregando && (
          <p style={{ textAlign: "center", color: "#94A3B8" }}>
            Carregando tarefas...
          </p>
        )}
        {erro && (
          <p style={{ textAlign: "center", color: "#EF4444" }}>{erro}</p>
        )}

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
                <span className="kanban-contador"></span>

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
      </main>

      {/* ==================================
          RODAPÉ
      ================================== */}

      <footer>
        <p>TaskFlow 2026 - Lavínia D Acioly</p>
      </footer>
    </div>
  );
}

export default Kanban;
