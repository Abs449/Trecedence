// ─── API Types ────────────────────────────────────────────────────────────────

export interface HierarchyObject {
  root: string;
  tree: Record<string, unknown>;
  depth?: number;
  has_cycle?: true;
}

export interface Summary {
  total_trees: number;
  total_cycles: number;
  largest_tree_root: string;
}

export interface BFHLResponse {
  user_id: string;
  email_id: string;
  college_roll_number: string;
  hierarchies: HierarchyObject[];
  invalid_entries: string[];
  duplicate_edges: string[];
  summary: Summary;
}

export interface BFHLRequest {
  data: string[];
}

export interface ApiError {
  error: string;
}
