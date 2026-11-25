import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Kanban from "./Kanban";
import { AuthProvider } from "../Contexts/AuthContext";
import api from "../api";

// Troca o api.js inteiro por um de mentira
vi.mock("../api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  mensagensDeErro: vi.fn(() => ["erro"]),
}));

// O que a API de mentira responde em cada endereço
const respostas = {
  "/prioridades": [
    { id: 1, descricao: "Alto", cor: "#EF4444" },
    { id: 2, descricao: "Médio", cor: "#F59E0B" },
  ],

  "/tarefas": [
    {
      id: 1,
      texto: "Modelar o banco",
      coluna: "afazer",
      prioridade_id: 1,
      prioridade: "Alto",
      prioridade_cor: "#EF4444",
      usuario_id: 1,
      projeto_id: 10,
    },
    {
      id: 2,
      texto: "Criar a API",
      coluna: "andamento",
      prioridade_id: 2,
      prioridade: "Médio",
      prioridade_cor: "#F59E0B",
      usuario_id: 1,
      projeto_id: 10,
    },
  ],

  "/usuarios": [{ id: 1, nome: "Ana Lima" }],

  "/projetos": [{ id: 10, nome: "TaskFlow" }],
};

function desenharKanban() {
  render(
    <AuthProvider>
      <Kanban />
    </AuthProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  api.get.mockImplementation((url) =>
    Promise.resolve({ data: respostas[url] }),
  );
});

describe("Kanban", () => {
  test("mostra Carregando enquanto a API não responde", () => {
    desenharKanban();

    expect(screen.getByText("Carregando tarefas...")).toBeInTheDocument();
  });

  test("carrega e mostra as tarefas da API", async () => {
    desenharKanban();

    expect(await screen.findByText("Modelar o banco")).toBeInTheDocument();
    expect(screen.getByText("Criar a API")).toBeInTheDocument();

    expect(screen.queryByText("Carregando tarefas...")).not.toBeInTheDocument();

    expect(api.get).toHaveBeenCalledWith("/tarefas");
  });

  test("se a API falha, mostra a mensagem de erro", async () => {
    const erroConsole = vi.spyOn(console, "error").mockImplementation(() => {});

    api.get.mockRejectedValue(new Error("Network Error"));

    desenharKanban();

    expect(
      await screen.findByText(
        "Erro ao carregar os dados. Verifique a conexão com a API.",
      ),
    ).toBeInTheDocument();

    erroConsole.mockRestore();
  });

  test("criar: o + abre o modal e a tarefa aparece", async () => {
    const user = userEvent.setup();

    api.post.mockResolvedValue({
      data: {
        id: 3,
        texto: "Testar o Kanban",
        coluna: "afazer",
        prioridade: "Médio",
        prioridade_cor: "#F59E0B",
      },
    });

    desenharKanban();

    const botoesAdicionar = screen.getAllByRole("button", { name: "+" });

    await user.click(botoesAdicionar[0]);
    await user.type(screen.getByLabelText("Tarefa"), "Testar o Kanban");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(api.post).toHaveBeenCalledWith(
      "/tarefas",
      expect.objectContaining({
        texto: "Testar o Kanban",
        coluna: "afazer",
      }),
    );

    expect(await screen.findByText("Testar o Kanban")).toBeInTheDocument();
  });

  test("excluir: clicar no X chama a API e remove a tarefa", async () => {
    const user = userEvent.setup();

    api.delete.mockResolvedValue({ data: {} });

    desenharKanban();

    expect(await screen.findByText("Modelar o banco")).toBeInTheDocument();

    const botoesExcluir = screen.getAllByTitle("Excluir tarefa");

    await user.click(botoesExcluir[0]);

    expect(api.delete).toHaveBeenCalledWith("/tarefas/1");
    expect(screen.queryByText("Modelar o banco")).not.toBeInTheDocument();
  });

    test("avançar: clicar na seta chama a API com a próxima coluna", async () => {
    const user = userEvent.setup();

    api.put.mockResolvedValue({ data: {} });

    desenharKanban();

    expect(await screen.findByText("Modelar o banco")).toBeInTheDocument();

    const botoesAvancar = screen.getAllByTitle("Avançar tarefa");

    await user.click(botoesAvancar[0]);

    expect(api.put).toHaveBeenCalledWith(
      "/tarefas/1",
      expect.objectContaining({
        coluna: "andamento",
      }),
    );
  });
});
