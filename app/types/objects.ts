import { ToasterToast } from "@/hooks/useToast";

export type VectorizerField = {
  named_vector: string;
  vectorizer: string;
  model: string;
};

export type Vectorizer = {
  fields: {
    [key: string]: VectorizerField[];
  };
  global: VectorizerField;
};

export type Collection = {
  name: string;
  total: number;
  vectorizer: Vectorizer;
  processed: boolean;
  prompts: string[];
};

export type DecisionTreeNode = {
  name: string;
  id: string;
  description: string;
  instruction: string;
  reasoning: string;
  branch: boolean;
  options: { [key: string]: DecisionTreeNode };
  // Note: Added for frontend only - not from backend
  choosen?: boolean;
  blocked?: boolean;
};

export type ModelProvider = {
  [key: string]: Model;
};

export type Model = {
  name: string;
  api_keys: string[];
  speed: string;
  accuracy: string;
};

export type MetadataCollection = {
  mappings: { [key: string]: { [key: string]: [key: string] } };
  fields: { [key: string]: MetadataField };
  length: number;
  summary: string;
  name: string;
  named_vectors: MetadataNamedVector[];
  vectorizer: MetadataVectorizer;
};

export type MetadataVectorizer = {
  vectorizer: string;
  model: string;
};

export type MetadataNamedVector = {
  source_properties: string[];
  enabled: boolean;
  vectorizer: string;
  model: string;
  description: string;
  name: string;
};

export type MetadataField = {
  range: [number, number];
  type: string;
  groups: { [key: string]: GroupMetadataField };
  mean: number;
  name: string;
  description: string;
  date_range: string[];
  date_mean: string;
};

export type GroupMetadataField = {
  value: string;
  count: number;
};

export type Filter = {
  field: string;
  operator: string;
  value: string | number | boolean;
};

export type Toast = {
  collection_name: string;
  progress: number;
  startTime: number; // Add timestamp when analysis started
  currentMessage: string; // Store the current message from backend
  toast: {
    id: string;
    dismiss: () => void;
    update: (props: ToasterToast) => void;
  };
};

export type UserConfig = {
  backend: BackendConfig | null;
  frontend: FrontendConfig | null;
};

export type BackendConfig = {
  name: string;
  style: string;
  agent_description: string;
  end_goal: string;
  branch_initialisation: string;
  id: string | null;
  agent_config: AgentConfig;
};

export type FrontendConfig = {
  tree_timeout: number;
  client_timeout: number;
  // Storage cluster credentials removed - managed globally via system settings
  // Save flags removed - conversations and configs are always saved (core SaaS functionality)
};

export type AgentConfig = {
  BASE_MODEL: string | null;
  BASE_PROVIDER: string | null;
  COMPLEX_MODEL: string | null;
  COMPLEX_PROVIDER: string | null;
  BASE_MAX_TOKENS: number | null;
  BASE_TEMPERATURE: number | null;
  COMPLEX_MAX_TOKENS: number | null;
  COMPLEX_TEMPERATURE: number | null;
  MODEL_API_BASE: string | null;
  USE_FEEDBACK: boolean;
  BASE_USE_REASONING: boolean;
  COMPLEX_USE_REASONING: boolean;
  PREPROCESSING_CARDINALITY_THRESHOLD: number;
  PREPROCESSING_MAX_CONCURRENT: number;
  PREPROCESSING_MIN_SAMPLE_SIZE: number;
};

// For PATCHing collection metadata (matches backend schema)
export type PatchCollectionMetadataPayload = {
  named_vectors?: {
    name: string;
    enabled?: boolean;
    description?: string;
  }[];
  summary?: string;
  mappings?: Record<string, Record<string, string>>;
  fields?: {
    name: string;
    description: string;
  }[];
};
