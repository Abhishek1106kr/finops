import type { Logger } from "@pazy-pro/logging";

export interface AgentNode<S> {
  name: string;
  run(state: S): Promise<Partial<S>>;
}

/**
 * Minimal sequential state-graph runner: each node reads the accumulated
 * state and returns a patch, mirroring LangGraph's node/state-reducer model
 * without pulling in the full framework for what are currently linear
 * pipelines. Nodes are named and logged individually so agent decisions are
 * traceable step-by-step (CLAUDE.md's observability requirement) — a
 * genuine `@langchain/langgraph` StateGraph is a drop-in replacement here
 * once agents need branching/looping, since the AgentNode contract matches
 * LangGraph's node signature.
 */
export class AgentGraph<S extends object> {
  constructor(
    private readonly agentName: string,
    private readonly nodes: AgentNode<S>[],
  ) {}

  async run(initialState: S, logger: Logger): Promise<S> {
    let state = initialState;
    for (const node of this.nodes) {
      const startedAt = Date.now();
      const patch = await node.run(state);
      state = { ...state, ...patch };
      logger.info(
        { agent: this.agentName, node: node.name, durationMs: Date.now() - startedAt },
        "agent.node.completed",
      );
    }
    return state;
  }
}
