function ListaTarefas({
  tarefas,
  prioridades = [],
  usuarios = [],
  projetos = [],
  onDeletar,
  onConcluir,
  onEditar,
  onMover,
  colunaAnterior,
  colunaProxima,
}) {
  if (tarefas.length === 0) {
    return <p className="msg-vazia">Nenhuma tarefa nesta coluna.</p>;
  }

  return (
    <div className="lista-tarefas">
      {tarefas.map((tarefa) => {
        const prioridadeTarefa = prioridades.find(
          (p) => Number(p.id) === Number(tarefa.prioridade_id),
        );

        const nomePrioridade = prioridadeTarefa?.descricao || "";

        const responsavel = usuarios.find(
          (u) => Number(u.id) === Number(tarefa.usuario_id),
        );

        const projeto = projetos.find(
          (p) => Number(p.id) === Number(tarefa.projeto_id),
        );

        return (
          <div key={tarefa.id} className={`card ${nomePrioridade}`}>
            {/* TEXTO */}
            <p>{tarefa.texto}</p>

            {/* RESPONSÁVEL E PROJETO */}
            <div className="detalhes-tarefa">
              <small>Responsável: {responsavel?.nome || "Não informado"}</small>

              <small>Projeto: {projeto?.nome || "Não informado"}</small>
            </div>

            {/* BOTÕES */}
            <div className="acoes">
              {colunaAnterior && (
                <button
                  type="button"
                  onClick={() => onMover(tarefa.id, colunaAnterior)}
                  title="Voltar tarefa"
                >
                  ←
                </button>
              )}

              {colunaProxima && (
                <button
                  type="button"
                  onClick={() => onMover(tarefa.id, colunaProxima)}
                  title="Avançar tarefa"
                >
                  →
                </button>
              )}

              <button
                type="button"
                onClick={() => onEditar(tarefa)}
                title="Editar tarefa"
              >
                ✏️
              </button>

              <button
                type="button"
                onClick={() => onDeletar(tarefa.id)}
                title="Excluir tarefa"
              >
                🗑️
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default ListaTarefas;
