import styles from './TarefasItem.module.css';

function TarefaItem({ texto, concluida, prioridade, onDeletar, onConcluir }) {

  // Classe do item
  const classeItem =
    (concluida
      ? styles.tarefa + ' ' + styles.concluida
      : styles.tarefa) +
    ' ' +
    styles[prioridade];

  // Classe do texto
  const classeTexto =
    concluida
      ? styles.textoTarefa + ' ' + styles['texto-tarefa']
      : styles.textoTarefa;

  // Classe da prioridade
  const classePrioridade =
    styles['badge-prioridade'] + ' ' + styles['badge-' + prioridade];

  return (
    <li className={classeItem} onClick={onConcluir}>
      <span className={classeTexto}>{texto}</span>

      <span className={classePrioridade}>
        {prioridade}
      </span>

      <button
        className={styles.btnDeletar}
        onClick={(e) => {
          e.stopPropagation(); // impede marcar como concluída ao excluir
          onDeletar();
        }}
      >
        X
      </button>
    </li>
  );
}

export default TarefaItem;