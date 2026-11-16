
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import api, { mensagensDeErro } from "../api";
import styles from "./Projetos.module.css";

function Projetos() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [projetos, setProjetos] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [ordem, setOrdem] = useState("todos");

  const [modalAberto, setModalAberto] = useState(false);
  const [projetoEditando, setProjetoEditando] = useState(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erroModal, setErroModal] = useState("");
  const [salvando, setSalvando] = useState(false);

  // ==========================================
  // CARREGAR PROJETOS E TAREFAS
  // ==========================================

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [resProjetos, resTarefas] = await Promise.all([
        api.get("/projetos"),
        api.get("/tarefas"),
      ]);

      setProjetos(resProjetos.data);
      setTarefas(resTarefas.data);
    } catch (err) {
      setErro(mensagensDeErro(err).join(" "));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  // ==========================================
  // CONTAR TAREFAS DO PROJETO
  // ==========================================

  function contarTarefas(projetoId) {
    const tarefasProjeto = tarefas.filter(
      (tarefa) => Number(tarefa.projeto_id) === Number(projetoId),
    );

    return {
      total: tarefasProjeto.length,
      afazer: tarefasProjeto.filter((t) => t.coluna === "afazer").length,
      andamento: tarefasProjeto.filter((t) => t.coluna === "andamento").length,
      concluido: tarefasProjeto.filter((t) => t.coluna === "concluido").length,
    };
  }

  // ==========================================
  // ABRIR MODAL PARA NOVO PROJETO
  // ==========================================

  function abrirNovoProjeto() {
    setProjetoEditando(null);
    setNome("");
    setDescricao("");
    setErroModal("");
    setModalAberto(true);
  }

  // ==========================================
  // ABRIR MODAL PARA EDITAR
  // ==========================================

  function abrirEdicao(projeto) {
    setProjetoEditando(projeto);
    setNome(projeto.nome || "");
    setDescricao(projeto.descricao || "");
    setErroModal("");
    setModalAberto(true);
  }

  // ==========================================
  // FECHAR MODAL
  // ==========================================

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    setProjetoEditando(null);
    setErroModal("");
  }

  // ==========================================
  // SALVAR PROJETO
  // ==========================================

  async function salvarProjeto(e) {
    e.preventDefault();
    setErroModal("");

    if (!nome.trim()) {
      setErroModal("Informe o nome do projeto.");
      return;
    }

    const dadosProjeto = {
      nome: nome.trim(),
      descricao: descricao.trim(),
    };

    try {
      setSalvando(true);

      if (projetoEditando) {
        const resposta = await api.put(
          `/projetos/${projetoEditando.id}`,
          dadosProjeto,
        );

        setProjetos((lista) =>
          lista.map((projeto) =>
            projeto.id === projetoEditando.id ? resposta.data : projeto,
          ),
        );
      } else {
        const resposta = await api.post("/projetos", dadosProjeto);

        setProjetos((lista) => [...lista, resposta.data]);
      }

      setModalAberto(false);
      setProjetoEditando(null);
    } catch (err) {
      setErroModal(mensagensDeErro(err).join(" "));
    } finally {
      setSalvando(false);
    }
  }

  // ==========================================
  // ORDENAR PROJETOS
  // ==========================================

  const projetosOrdenados = [...projetos].sort((a, b) => {
    if (ordem === "recentes") {
      return new Date(b.criado_em) - new Date(a.criado_em);
    }

    if (ordem === "antigos") {
      return new Date(a.criado_em) - new Date(b.criado_em);
    }

    return 0;
  });

  // ==========================================
  // EXCLUIR PROJETO
  // ==========================================

  async function excluirProjeto(projeto) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o projeto "${projeto.nome}"?`,
    );

    if (!confirmar) return;

    setErro("");

    try {
      await api.delete(`/projetos/${projeto.id}`);

      setProjetos((lista) =>
        lista.filter((item) => item.id !== projeto.id),
      );
    } catch (err) {
      if (err.response?.status === 409) {
        setErro(
          "Não é possível excluir este projeto porque ele possui tarefas associadas. Remova as tarefas antes de tentar novamente.",
        );
        return;
      }

      setErro(mensagensDeErro(err).join(" "));
    }
  }

  // ==========================================
  // JSX
  // ==========================================

  return (
    <div className={styles.container}>
      <header className={styles.cabecalho}>
        <div>
          <h1>Meus Projetos</h1>
          <p>Organize seus projetos e acompanhe suas tarefas.</p>
        </div>

        <span className={styles.totalProjetos}>
          {projetos.length} projetos
        </span>

        <select
          className={styles.filtroOrdem}
          value={ordem}
          onChange={(e) => setOrdem(e.target.value)}
        >
          <option value="todos">Todos os projetos</option>
          <option value="antigos">Mais antigos</option>
          <option value="recentes">Mais recentes</option>
        </select>

        <button className={styles.botaoNovo} onClick={abrirNovoProjeto}>
          + Novo projeto
        </button>
      </header>

      {carregando && <p>Carregando projetos...</p>}

      {erro && <p className={styles.erro}>{erro}</p>}

      {!carregando && !erro && projetos.length === 0 && (
        <p>Nenhum projeto cadastrado.</p>
      )}

      <section className={styles.listaProjetos}>
        {!carregando &&
          !erro &&
          projetosOrdenados.map((projeto) => {
            const quantidade = contarTarefas(projeto.id);

            return (
              <article key={projeto.id} className={styles.cardProjeto}>
                <div className={styles.cardCabecalho}>
                  <h2>{projeto.nome}</h2>
                </div>

                <p className={styles.descricao}>
                  {projeto.descricao || "Sem descrição cadastrada."}
                </p>

                <div className={styles.responsavel}>
                  <span>Responsável:</span>
                  <strong>
                    {usuario?.nome || "Usuário logado"}
                  </strong>
                </div>

                <div className={styles.resumo}>
                  <strong>{quantidade.total}</strong>
                  <span>tarefas</span>
                </div>

                <div className={styles.estatisticas}>
                  <span>A fazer: {quantidade.afazer}</span>

                  <span>Em andamento: {quantidade.andamento}</span>

                  <span>Concluídas: {quantidade.concluido}</span>
                </div>

                <div className={styles.acoesProjeto}>
                  <button
                    className={styles.botaoTarefas}
                    onClick={() =>
                      navigate(`/projetos/${projeto.id}/tarefas`)
                    }
                  >
                    Tarefas do projeto
                  </button>

                  <div className={styles.acoesSecundarias}>
                    <button
                      className={styles.botaoEditar}
                      onClick={() => abrirEdicao(projeto)}
                    >
                      Editar
                    </button>

                    <button
                      className={styles.botaoExcluir}
                      onClick={() => excluirProjeto(projeto)}
                      title="Excluir projeto"
                      aria-label={`Excluir projeto ${projeto.nome}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="m19 6-1 14H6L5 6" />
                        <path d="M10 11v5" />
                        <path d="M14 11v5" />
                      </svg>
                    </button>
                  </div>
                </div>

                <small>
                  Criado em:{" "}
                  {new Date(projeto.criado_em).toLocaleDateString("pt-BR")}
                </small>
              </article>
            );
          })}
      </section>

      {/* ==================================
          MODAL DE PROJETO
      ================================== */}

      {modalAberto && (
        <div className={styles.modalFundo}>
          <div className={styles.modal}>
            <h2>
              {projetoEditando ? "Editar projeto" : "Novo projeto"}
            </h2>

            <form onSubmit={salvarProjeto}>
              <label htmlFor="nomeProjeto">Nome do projeto</label>

              <input
                id="nomeProjeto"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome do projeto"
                required
              />

              <label htmlFor="descricaoProjeto">Descrição</label>

              <textarea
                id="descricaoProjeto"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o projeto"
                rows="4"
              />

              {erroModal && (
                <p className={styles.erroModal}>{erroModal}</p>
              )}

              <div className={styles.acoesModal}>
                <button
                  type="button"
                  className={styles.botaoCancelar}
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={styles.botaoSalvar}
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Salvar projeto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projetos;
