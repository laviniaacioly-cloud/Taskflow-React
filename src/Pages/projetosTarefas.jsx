
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { mensagensDeErro } from "../api";
import ListaTarefas from "../componentes/ListaTarefas";
import styles from "./ProjetoTarefas.module.css";

function ProjetoTarefas() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projeto, setProjeto] = useState(null);
  const [tarefas, setTarefas] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const [
          resProjetos,
          resTarefas,
          resPrioridades,
          resUsuarios,
        ] = await Promise.all([
          api.get("/projetos"),
          api.get("/tarefas"),
          api.get("/prioridades"),
          api.get("/usuarios"),
        ]);

        const listaProjetos = resProjetos.data;
        const projetoEncontrado = listaProjetos.find(
          (item) => Number(item.id) === Number(id)
        );

        setProjetos(listaProjetos);
        setTarefas(resTarefas.data);
        setPrioridades(resPrioridades.data);
        setUsuarios(resUsuarios.data);
        setProjeto(projetoEncontrado || null);
      } catch (err) {
        setErro(mensagensDeErro(err).join(" "));
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [id]);

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

  const responsavel = usuarios.find(
    (usuario) =>
      Number(usuario.id) === Number(projeto?.usuario_id)
  );

  if (carregando) {
    return (
      <div className={styles.container}>
        <p>Carregando projeto e tarefas...</p>
      </div>
    );
  }

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
              {responsavel?.nome || "Usuário não encontrado"}
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
            usuarios={usuarios}
            projetos={projetos}
            onDeletar={() => {}}
            onConcluir={() => {}}
            onEditar={() => {}}
            onMover={() => {}}
          />
        </div>

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
            usuarios={usuarios}
            projetos={projetos}
            onDeletar={() => {}}
            onConcluir={() => {}}
            onEditar={() => {}}
            onMover={() => {}}
          />
        </div>

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
            usuarios={usuarios}
            projetos={projetos}
            onDeletar={() => {}}
            onConcluir={() => {}}
            onEditar={() => {}}
            onMover={() => {}}
          />
        </div>
      </section>
    </div>
  );
}

export default ProjetoTarefas;
