
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { mensagensDeErro } from "../api";
import { useAuth } from "../Contexts/AuthContext";
import ListaTarefas from "../componentes/ListaTarefas";
import Comentarios from "../componentes/Comentarios";
import styles from "./ProjetoTarefas.module.css";

function ProjetoTarefas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [projeto, setProjeto] = useState(null);
  const [tarefas, setTarefas] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // ==========================================
  // COMENTÁRIOS
  // ==========================================

  const [tarefaComentarios, setTarefaComentarios] = useState(null);

  function abrirComentarios(tarefa) {
    setTarefaComentarios(tarefa);
  }

  function fecharComentarios() {
    setTarefaComentarios(null);
  }

  // ==========================================
  // CARREGAR DADOS
  // ==========================================

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const [
          resProjeto,
          resProjetos,
          resTarefas,
          resPrioridades,
        ] = await Promise.all([
          api.get(`/projetos/${id}`),
          api.get("/projetos"),
          api.get("/tarefas"),
          api.get("/prioridades"),
        ]);

        setProjeto(resProjeto.data);
        setProjetos(resProjetos.data);
        setTarefas(resTarefas.data);
        setPrioridades(resPrioridades.data);
      } catch (err) {
        setProjeto(null);
        setErro(mensagensDeErro(err).join(" "));
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [id]);

  // ==========================================
  // FILTRAR TAREFAS DO PROJETO
  // ==========================================

  const tarefasDoProjeto = tarefas.filter(
    (tarefa) =>
      Number(tarefa.projeto_id ?? tarefa.projetoId) === Number(id)
  );

  const tarefasAFazer = tarefasDoProjeto.filter(
    (tarefa) => tarefa.coluna === "afazer"
  );

  const tarefasAndamento = tarefasDoProjeto.filter(
    (tarefa) => tarefa.coluna === "andamento"
  );

  const tarefasConcluidas = tarefasDoProjeto.filter(
    (tarefa) => tarefa.coluna === "concluido"
  );

  // ==========================================
  // CARREGAMENTO
  // ==========================================

  if (carregando) {
    return (
      <div className={styles.container}>
        <p>Carregando projeto e tarefas...</p>
      </div>
    );
  }

  // ==========================================
  // ERRO
  // ==========================================

  if (erro) {
    return (
      <div className={styles.container}>
        <button
          className={styles.botaoVoltar}
          onClick={() => navigate("/projetos")}
        >
          ← Voltar para projetos
        </button>

        <p className={styles.erro}>{erro}</p>
      </div>
    );
  }

  // ==========================================
  // PROJETO NÃO ENCONTRADO
  // ==========================================

  if (!projeto) {
    return (
      <div className={styles.container}>
        <button
          className={styles.botaoVoltar}
          onClick={() => navigate("/projetos")}
        >
          ← Voltar para projetos
        </button>

        <p>Projeto não encontrado.</p>
      </div>
    );
  }

  // ==========================================
  // TELA
  // ==========================================

  return (
    <div className={styles.container}>
      <button
        className={styles.botaoVoltar}
        onClick={() => navigate("/projetos")}
      >
        ← Voltar para projetos
      </button>

      {/* CARD DO PROJETO */}

      <section className={styles.cardProjeto}>
        <div className={styles.cabecalhoProjeto}>
          <div>
            <span className={styles.etiqueta}>PROJETO</span>
            <h1>{projeto.nome}</h1>
          </div>

          <span className={styles.totalTarefas}>
            {tarefasDoProjeto.length} tarefas
          </span>
        </div>

        <p className={styles.descricao}>
          {projeto.descricao || "Sem descrição cadastrada."}
        </p>

        <div className={styles.informacoesProjeto}>
          <div>
            <span>Responsável</span>
            <strong>
              {usuario?.nome || "Usuário não identificado"}
            </strong>
          </div>

          <div>
            <span>Criado em</span>
            <strong>
              {projeto.criado_em
                ? new Date(projeto.criado_em).toLocaleDateString("pt-BR")
                : "Não informado"}
            </strong>
          </div>
        </div>

        <div className={styles.resumoTarefas}>
          <div className={styles.resumoItem}>
            <strong>{tarefasAFazer.length}</strong>
            <span>A fazer</span>
          </div>

          <div className={styles.resumoItem}>
            <strong>{tarefasAndamento.length}</strong>
            <span>Em andamento</span>
          </div>

          <div className={styles.resumoItem}>
            <strong>{tarefasConcluidas.length}</strong>
            <span>Concluídas</span>
          </div>
        </div>
      </section>

      {/* KANBAN DO PROJETO */}

      <div className={styles.tituloKanban}>
        <h2>Tarefas do projeto</h2>
        <p>Acompanhe o andamento das tarefas deste projeto.</p>
      </div>

      <section className={`kanban ${styles.kanbanProjeto}`}>
        {/* A FAZER */}

        <div className="kanban-coluna">
          <div className="kanban-coluna-header">
            <h3>A Fazer</h3>
            <span className="kanban-contador">
              {tarefasAFazer.length}
            </span>
          </div>

          <ListaTarefas
            tarefas={tarefasAFazer}
            prioridades={prioridades}
            projetos={projetos}
            onDeletar={() => {}}
            onConcluir={() => {}}
            onEditar={() => {}}
            onMover={() => {}}
            onAbrirComentarios={abrirComentarios}
          />
        </div>

        {/* EM ANDAMENTO */}

        <div className="kanban-coluna">
          <div className="kanban-coluna-header">
            <h3>Em Andamento</h3>
            <span className="kanban-contador">
              {tarefasAndamento.length}
            </span>
          </div>

          <ListaTarefas
            tarefas={tarefasAndamento}
            prioridades={prioridades}
            projetos={projetos}
            onDeletar={() => {}}
            onConcluir={() => {}}
            onEditar={() => {}}
            onMover={() => {}}
            onAbrirComentarios={abrirComentarios}
          />
        </div>

        {/* CONCLUÍDAS */}

        <div className="kanban-coluna">
          <div className="kanban-coluna-header">
            <h3>Concluídas</h3>
            <span className="kanban-contador">
              {tarefasConcluidas.length}
            </span>
          </div>

          <ListaTarefas
            tarefas={tarefasConcluidas}
            prioridades={prioridades}
            projetos={projetos}
            onDeletar={() => {}}
            onConcluir={() => {}}
            onEditar={() => {}}
            onMover={() => {}}
            onAbrirComentarios={abrirComentarios}
          />
        </div>
      </section>

      {/* PAINEL DE COMENTÁRIOS */}

      <Comentarios
        tarefa={tarefaComentarios}
        aberto={Boolean(tarefaComentarios)}
        onFechar={fecharComentarios}
      />
    </div>
  );
}

export default ProjetoTarefas;
