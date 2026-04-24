import React from "react";

interface TreeViewProps {
  tree: Record<string, unknown>;
  depth?: number;
}

type TreeNode = Record<string, unknown>;

function NodeRow({
  label,
  isRoot,
  children,
  indentLevel,
  isLast,
}: {
  label: string;
  isRoot: boolean;
  children: [string, unknown][];
  indentLevel: number;
  isLast: boolean;
}) {
  const isLeaf = children.length === 0;
  const nodeClass = isRoot ? "root-node" : isLeaf ? "leaf-node" : "mid-node";

  return (
    <div>
      <div className="tree-node-row">
        {/* Indent guides */}
        {Array.from({ length: indentLevel }).map((_, i) => (
          <div key={i} className="tree-line-v" />
        ))}
        {indentLevel > 0 && (
          <div className="tree-branch" style={{ marginTop: isLast ? "0" : "0" }} />
        )}
        <span className={`tree-node-label ${nodeClass}`}>{label}</span>
      </div>
      {children.map(([childLabel, subtree], idx) => (
        <NodeRow
          key={childLabel}
          label={childLabel}
          isRoot={false}
          children={Object.entries(subtree as TreeNode)}
          indentLevel={indentLevel + 1}
          isLast={idx === children.length - 1}
        />
      ))}
    </div>
  );
}

export const TreeView: React.FC<TreeViewProps> = ({ tree }) => {
  const topEntries = Object.entries(tree);
  if (topEntries.length === 0) return null;

  return (
    <div className="tree-view">
      {topEntries.map(([rootLabel, subtree]) => (
        <NodeRow
          key={rootLabel}
          label={rootLabel}
          isRoot={true}
          children={Object.entries(subtree as TreeNode)}
          indentLevel={0}
          isLast={true}
        />
      ))}
    </div>
  );
};
