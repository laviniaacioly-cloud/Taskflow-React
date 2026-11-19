import styles from "./TarefasItem.module.css";

function TarefaItem({
  texto,
  concluida,
  prioridade,
  onDeletar,
  onConcluir,
  onMover,
  colunaProxima,
  colunaAnterior,
  onEditar,
}) {
  // Classe do item
  const classeItem =
    (concluida ? styles.tarefa + " " + styles.concluida : styles.tarefa) +
    " " +
    styles[prioridade];

  // Classe do texto
  const classeTexto = concluida
    ? styles.textoTarefa + " " + styles["texto-tarefa"]
    : styles.textoTarefa;

  // Classe da prioridade
  const classePrioridade =
    styles["badge-prioridade"] + " " + styles["badge-" + prioridade];

  return (
    <li className={classeItem} onClick={onConcluir}>
      <span className={classeTexto} onDoubleClick={onEditar}>
        {texto}
      </span>
      <span className={classePrioridade}>{prioridade || "Sem prioridade"}</span>

      {/* Setas aparecem somente no modo Kanban */}
      {onMover && (
        <div className={styles.acoesKanban}>
          {colunaAnterior && (
            <button
              type="button"
              className={styles.btnMover}
              onClick={(e) => {
                e.stopPropagation();
                onMover(colunaAnterior);
              }}
            >
              ←
            </button>
          )}

          {colunaProxima && (
            <button
              type="button"
              className={styles.btnMover}
              onClick={(e) => {
                e.stopPropagation();
                onMover(colunaProxima);
              }}
            >
              →
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        className={styles.btnDeletar}
        onClick={(e) => {
          e.stopPropagation();
          onDeletar();
        }}
      >
        X
      </button>
    </li>
  );
}

export default TarefaItem;
