import { DecisionTreePayload } from "@/app/types/payloads";
import { DecisionTreeNode } from "@/app/types/objects";
import { fetchWithAuth } from "@/lib/api/client";

export async function initializeTree(
  conversation_id: string,
  low_memory: boolean = false,
  token?: string
): Promise<DecisionTreePayload> {
  const startTime = performance.now();
  try {
    const response = await fetchWithAuth(
      `/init/tree/${conversation_id}`,
      {
        method: "POST",
        body: JSON.stringify({
          low_memory: low_memory,
        }),
        token,
      }
    );

    if (!response.ok) {
      console.error(
        `Initializing tree failed! status: ${response.status}, error: ${response.statusText}`
      );
      return {
        conversation_id: conversation_id,
        error: "Failed to initialize tree",
        tree: null,
      };
    }

    const data: DecisionTreePayload = await response.json();

    if (data.tree == null) {
      return {
        conversation_id: conversation_id,
        error: "Failed to initialize tree",
        tree: null,
      };
    }

    const resetChoosenBlocked = (node: DecisionTreeNode) => {
      node.choosen = false;
      node.blocked = false;

      if (node.options) {
        Object.values(node.options).forEach((option) => {
          resetChoosenBlocked(option);
        });
      }
    };
    resetChoosenBlocked(data.tree);
    data.tree.choosen = true;

    return data;
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    return {
      conversation_id: conversation_id,
      error: "Failed to initialize tree",
      tree: null,
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `init/tree took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}
