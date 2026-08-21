//ok!!!
import { useEffect, useState } from "react";
import Header from "./Header";
import axios from "axios";
import ModalTarefa from "./ModalTarefa";
import ListaTarefas from "./ListaTarefas";

const URL_API = "https://6a85ab769c451dc67a63ee5b.mockapi.io/tarefas";

function Kanban() {
  // ==========================================
  // TAREFAS
  // ==========================================

  const [tarefas, setTarefas] = useState([]);

  // ==========================================
  // CARREGAMENTO E ERROS
  // ==========================================

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
  // CARREGAR TAREFAS API
  // ==========================================

  useEffect(() => {
    setCarregando(true);
    setErro("");

    axios
      .get("https://6a85ab769c451dc67a63ee5b.mockapi.io/tarefas")
      .then((resposta) => {
        setTarefas(resposta.data);
      })
      .catch((erro) => {
        console.error("Erro ao carregar tarefas", erro);
      })
      .finally(() => {
        setCarregando(false);
      });
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
    setColunaAtiva(tarefa.coluna);
    setModalAberto(true);
  }

  // ==========================================
  // SALVAR TAREFA DO MODAL -editar tarefa
  // ==========================================
  async function salvarTarefa(dados) {
    try {
      if (dados.id !== undefined) {
        // EDITAR — PUT com o id na URL
        const { data: tarefaEditada } = await axios.put(URL_API + '/' + dados.id,
          {
            texto:      dados.texto,
            prioridade: dados.prioridade,
            cidade:     dados.cidade,
            coluna:     dados.coluna,
          }
        );
        // Atualizar a tarefa no estado local
        setTarefas(tarefasAtuais => tarefasAtuais.map(t => t.id === dados.id ? tarefaEditada : t));
      } else {
        // CRIAR — POST (slide anterior)
        const { data: novaTarefa } = await axios.post(URL_API, dados);
        setTarefas(tarefasAtuais => [...tarefasAtuais, novaTarefa]);
      }
    } catch (e) {
      setErro('Erro ao salvar tarefa.');
      console.error(e);
    }
  }


  // ==========================================
  // EXCLUIR TAREFA
  // ==========================================

  async function deletarTarefa(id) {
    const confirmado = window.confirm(
      "Tem certeza que deseja deletar essa tarefa?",
    );
    if (!confirmado) return;

    try {
      await axios.delete(
        "https://6a85ab769c451dc67a63ee5b.mockapi.io/tarefas" + "/" + id,
      );

      setTarefas((tarefasAtuais) =>
        tarefasAtuais.filter((tarefa) => tarefa.id !== id),
      );
    } catch (erro) {
      setErro("Erro ao deletar tarefa. Tent novamente.");
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
      // PATCH atualiza apenas os campos enviados
      // Ideal para mover tarefa — só o campo coluna muda

      const { data: tarefaMovida } = await axios.put(URL_API + "/" + id, {
        coluna: novaColuna,
      });

      // Atualizar o estado local com a tarefa retornada
      setTarefas((tarefasAtuais) =>
        tarefasAtuais.map((tarefa) =>
          tarefa.id === id ? tarefaMovida : tarefa,
        ),
      );
    } catch (erro) {
      setErro("Erro ao mover tarefa. Tente novamente.");
    }
  }
  // ==========================================
  // ADICIONAR PELO FORMULÁRIO ANTIGO
  // ==========================================

  async function adicionarTarefa() {
    if (texto.trim() === "") return;

    const novaTarefa = {
      texto: texto.trim(),
      cep,
      cidade,
      prioridade,
      coluna: "afazer",
      concluida: false,
    };

    try {
      const resposta = await axios.post(
        "https://6a85ab769c451dc67a63ee5b.mockapi.io/tarefas",
        novaTarefa,
      );

      setTarefas([...tarefas, resposta.data]);

      setTexto("");
      setCep("");
      setCidade("");
      setPrioridade("media");
      setErroCep("");
    } catch (erro) {
      console.error("Erro ao criar tarefa:", erro);
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
                <span className="kanban-contador">
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
