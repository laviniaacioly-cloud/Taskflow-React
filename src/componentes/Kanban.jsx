import { useEffect, useState } from "react";
import Header from "./Header";
import api, { mensagensDeErro } from "../api";
import ModalTarefa from "./ModalTarefa";
import ListaTarefas from "./ListaTarefas";
import ModalPrioridade from "./ModalPrioridade";

function Kanban() {
  // ==========================================
  // TAREFAS, CARREGAMENTO E ERROS
  // ==========================================

  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [prioridades, setPrioridades] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [projetos, setProjetos] = useState([]);

  const [modalPrioridadeAberto, setModalPrioridadeAberto] = useState(false);
  const [prioridadeEditando, setPrioridadeEditando] = useState(null);
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

  async function cadastrarPrioridade(novaPrioridade) {
    setPrioridades((atuais) => {
      const jaExiste = atuais.some(
        (p) =>
          p.descricao.toLowerCase() === novaPrioridade.descricao.toLowerCase(),
      );

      if (jaExiste) return atuais;

      return [...atuais, novaPrioridade];
    });
  }

  function abrirModalEditarPrioridade(prioridade) {
    setPrioridadeEditando(prioridade);
    setModalPrioridadeAberto(true);
  }

  function atualizarPrioridade(prioridadeAtualizada) {
    setPrioridades((atuais) =>
      atuais.map((p) =>
        p.id === prioridadeAtualizada.id ? prioridadeAtualizada : p,
      ),
    );

    setPrioridadeEditando(null);
  }

  // EXCLUIR PRIORIDADE
  async function excluirPrioridade(prioridade) {
    const confirmar = window.confirm(
      `Deseja excluir a prioridade "${prioridade.descricao}"?`,
    );

    if (!confirmar) return;

    try {
      setErro("");

      await api.delete(`/prioridades/${prioridade.id}`);

      setPrioridades((atuais) => atuais.filter((p) => p.id !== prioridade.id));

      if (filtroPrioridade === prioridade.descricao.toLowerCase()) {
        setFiltroPrioridade("todas");
      }
    } catch (err) {
      setErro(mensagensDeErro(err).join(" "));
    }
  }

  // ==========================================
  // FILTRO
  // ==========================================

  const [filtroPrioridade, setFiltroPrioridade] = useState("todas");

  // ==========================================
  // CARREGAR TAREFAS API
  // ==========================================

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const [resTarefas, resPrioridades, resUsuarios, resProjetos] =
          await Promise.all([
            api.get("/tarefas"),
            api.get("/prioridades"),
            api.get("/usuarios"),
            api.get("/projetos"),
          ]);

        setPrioridades(resPrioridades.data);
        setTarefas(resTarefas.data);
        setUsuarios(resUsuarios.data);
        setProjetos(resProjetos.data);
      } catch (e) {
        setErro("Erro ao carregar os dados. Verifique a conexão com a API.");
        console.error("Erro ao carregar dados:", e);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
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
    try {
      setErro("");

      if (dados.id) {
        const resposta = await api.put(`/tarefas/${dados.id}`, dados);

        setTarefas((tarefasAtuais) =>
          tarefasAtuais.map((t) => (t.id === dados.id ? resposta.data : t)),
        );
      } else {
        const resposta = await api.post("/tarefas", dados);

        setTarefas((tarefasAtuais) => [...tarefasAtuais, resposta.data]);
      }
    } catch (err) {
      const mensagens = mensagensDeErro(err);
      setErro(mensagens.join(" "));
      console.error("Erro ao salvar tarefa:", err);
    }
  }

  // ==========================================
  // EXCLUIR TAREFA
  // ==========================================

  async function deletarTarefa(id) {
    try {
      setErro("");

      await api.delete(`/tarefas/${id}`);

      setTarefas((tarefasAtuais) => tarefasAtuais.filter((t) => t.id !== id));
    } catch (err) {
      const mensagens = mensagensDeErro(err);
      setErro(mensagens.join(" "));
      console.error("Erro ao deletar tarefa:", err);
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
      setErro("");

      const tarefa = tarefas.find((t) => t.id === id);

      if (!tarefa) return;

      const resposta = await api.put(`/tarefas/${id}`, {
        ...tarefa,
        coluna: novaColuna,
      });

      setTarefas((tarefasAtuais) =>
        tarefasAtuais.map((t) => (t.id === id ? resposta.data : t)),
      );
    } catch (err) {
      const mensagens = mensagensDeErro(err);
      setErro(mensagens.join(" "));
      console.error("Erro ao mover tarefa:", err);
    }
  }

  // ==========================================
  // FILTRO
  // ==========================================

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtroPrioridade === "todas") {
      return true;
    }

    const prioridadeTarefa = prioridades.find(
      (p) => p.id === tarefa.prioridade_id,
    );

    return prioridadeTarefa?.descricao === filtroPrioridade;
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
          <div style={{ margin: "12px 0" }}>
            <button
              type="button"
              className="kanban-btn-add"
              onClick={() => setModalPrioridadeAberto(true)}
              style={{
                width: "auto",
                minWidth: "180px",
                whiteSpace: "nowrap",
                padding: "10px 16px",
              }}
            >
              + Nova prioridade
            </button>
          </div>

          <label>Filtrar por prioridade:</label>
          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
          >
            <option value="todas">Todas</option>

            {prioridades.map((prioridade) => (
              <option
                key={prioridade.id}
                value={prioridade.descricao.toLowerCase()}
              >
                {prioridade.descricao.charAt(0).toUpperCase() +
                  prioridade.descricao.slice(1)}
              </option>
            ))}
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
              prioridades={prioridades}
              usuarios={usuarios}
              projetos={projetos}
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
                <span className="kanban-contador">{quantidadeAndamento}</span>

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
              prioridades={prioridades}
              usuarios={usuarios}
              projetos={projetos}
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
              prioridades={prioridades}
              usuarios={usuarios}
              projetos={projetos}
              onDeletar={deletarTarefa}
              onConcluir={concluirTarefa}
              onEditar={abrirModalEditar}
              onMover={moverTarefa}
              colunaAnterior="andamento"
              colunaProxima={null}
            />
          </div>
        </section>

        {/* LEGENDA DE PRIORIDADES */}
        <section className="legenda-prioridades">
          <div className="legenda-prioridades-cabecalho">
            <div>
              <h3>Legenda de prioridades</h3>
              <p>Consulte e gerencie as prioridades do projeto.</p>
            </div>
          </div>

          <div className="legenda-prioridades-lista">
            {prioridades.map((prioridade) => (
              <div className="legenda-prioridade-item" key={prioridade.id}>
                <span
                  className="legenda-prioridade-cor"
                  style={{
                    backgroundColor: prioridade.cor || "#a00998",
                  }}
                />

                <span className="legenda-prioridade-nome">
                  {prioridade.descricao.charAt(0).toUpperCase() +
                    prioridade.descricao.slice(1)}
                </span>

                <button
                  type="button"
                  onClick={() => abrirModalEditarPrioridade(prioridade)}
                  title="Editar prioridade"
                  aria-label={`Editar ${prioridade.descricao}`}
                >
                  ✏️
                </button>

                <button
                  type="button"
                  onClick={() => excluirPrioridade(prioridade)}
                  title="Excluir prioridade"
                  aria-label={`Excluir ${prioridade.descricao}`}
                >
                  🗑️
                </button>
              </div>
            ))}
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
          prioridades={prioridades}
          usuarios={usuarios}
          projetos={projetos}
        />
        <ModalPrioridade
          aberto={modalPrioridadeAberto}
          onFechar={() => {
            setModalPrioridadeAberto(false);
            setPrioridadeEditando(null);
          }}
          onCadastrada={cadastrarPrioridade}
          prioridadeEditando={prioridadeEditando}
          onEditada={atualizarPrioridade}
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
