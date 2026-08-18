function ListaTarefas({
  tarefas,
  onDeletar,
  onConcluir,
  onEditar,
  onMover,
  colunaAnterior,
  colunaProxima,
}) {
  if (tarefas.length === 0) {
    return (
      <p className="msg-vazia">
        Nenhuma tarefa nesta coluna.
      </p>
    );
  }

  return (
    <div className="lista-tarefas">
      {tarefas.map((tarefa) => (
        <div
          key={tarefa.id}
          className={`card ${tarefa.prioridade}`}
        >
          {/* TEXTO */}
          <p>{tarefa.texto}</p>

          {/* CIDADE */}
          {tarefa.cidade && (
            <small className="cidade">
              {tarefa.cidade}
            </small>
          )}

          {/* BOTÕES */}
          <div className="acoes">

            {/* MOVER PARA TRÁS */}
            {colunaAnterior && (
              <button
                type="button"
                onClick={() =>
                  onMover(
                    tarefa.id,
                    colunaAnterior
                  )
                }
                title="Voltar tarefa"
              >
                ←
              </button>
            )}

            {/* MOVER PARA FRENTE */}
            {colunaProxima && (
              <button
                type="button"
                onClick={() =>
                  onMover(
                    tarefa.id,
                    colunaProxima
                  )
                }
                title="Avançar tarefa"
              >
                →
              </button>
            )}

            {/* EDITAR */}
            <button
              type="button"
              onClick={() =>
                onEditar(tarefa)
              }
              title="Editar tarefa"
            >
              ✏️
            </button>

            {/* EXCLUIR */}
            <button
              type="button"
              onClick={() =>
                onDeletar(tarefa.id)
              }
              title="Excluir tarefa"
            >
              🗑️
            </button>

          </div>
        </div>
      ))}
    </div>
  );
}

export default ListaTarefas;