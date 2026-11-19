import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TarefaItem from "./TarefasItem";

describe("TarefaItem", () => {
  test("mostra o texto e a prioridade da tarefa", () => {
    render(<TarefaItem texto="Estudar Vitest" prioridade="Alta" />);

    expect(screen.getByText("Estudar Vitest")).toBeInTheDocument();
    expect(screen.getByText("Alta")).toBeInTheDocument();
  });

  test("mostra Sem prioridade quando a tarefa não tem prioridade", () => {
    render(<TarefaItem texto="Estudar Vitest" />);

    expect(screen.getByText("Sem prioridade")).toBeInTheDocument();
  });

  test("no modo lista, não mostra as setas", () => {
    render(<TarefaItem texto="Estudar Vitest" />);

    const setaEsquerda = screen.queryByRole("button", { name: "←" });
    const setaDireita = screen.queryByRole("button", { name: "→" });

    const botaoX = screen.getByRole("button", { name: "X" });

    expect(setaEsquerda).not.toBeInTheDocument();
    expect(setaDireita).not.toBeInTheDocument();
    expect(botaoX).toBeInTheDocument();
  });

  test("na primeira coluna, só mostra a seta →", () => {
    render(
      <TarefaItem
        texto="Estudar Vitest"
        onMover={vi.fn()}
        colunaProxima="andamento"
      />,
    );

    const setaEsquerda = screen.queryByRole("button", { name: "←" });
    const setaDireita = screen.getByRole("button", { name: "→" });

    expect(setaEsquerda).not.toBeInTheDocument();
    expect(setaDireita).toBeInTheDocument();
  });

  test("clicar na → chama o onMover com a próxima coluna", async () => {
    const user = userEvent.setup();
    const onMover = vi.fn();

    render(
      <TarefaItem
        texto="Estudar Vitest"
        onMover={onMover}
        colunaProxima="andamento"
      />,
    );

    await user.click(screen.getByRole("button", { name: "→" }));

    expect(onMover).toHaveBeenCalledTimes(1);
    expect(onMover).toHaveBeenCalledWith("andamento");
  });

  test("clicar no X chama o onDeletar", async () => {
    const user = userEvent.setup();
    const onDeletar = vi.fn();

    render(<TarefaItem texto="Estudar Vitest" onDeletar={onDeletar} />);

    await user.click(screen.getByRole("button", { name: "X" }));

    expect(onDeletar).toHaveBeenCalledTimes(1);
  });

  test("dar duplo clique no texto chama o onEditar", async () => {
    const user = userEvent.setup();
    const onEditar = vi.fn();

    render(<TarefaItem texto="Estudar Vitest" onEditar={onEditar} />);

    await user.dblClick(screen.getByText("Estudar Vitest"));

    expect(onEditar).toHaveBeenCalledTimes(1);
  });
});
