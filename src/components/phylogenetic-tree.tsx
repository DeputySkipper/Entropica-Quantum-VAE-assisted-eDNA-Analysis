import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { GitBranch, Info } from "lucide-react";
import { useState } from "react";

interface PhylogeneticNode {
  id: string;
  name: string;
  children?: PhylogeneticNode[];
  distance?: number;
  support?: number;
  classification?: string;
  isNovel?: boolean;
}

interface PhylogeneticTreeProps {
  data: PhylogeneticNode;
  isLoading: boolean;
}

export function PhylogeneticTree({ data, isLoading }: PhylogeneticTreeProps) {
  const [selectedNode, setSelectedNode] = useState<PhylogeneticNode | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-400" />
            Phylogenetic Relationships
          </CardTitle>
          <CardDescription>
            Evolutionary tree showing relationships between taxa clusters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted/20 rounded animate-pulse flex items-center justify-center">
            <div className="text-muted-foreground">Loading phylogenetic tree...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderNode = (node: PhylogeneticNode, x: number, y: number, level: number): JSX.Element => {
    const isLeaf = !node.children || node.children.length === 0;
    const childSpacing = 60;
    const childrenY = node.children ? 
      node.children.map((_, idx) => y + (idx - (node.children!.length - 1) / 2) * childSpacing) : [];

    return (
      <g key={node.id}>
        {/* Node circle */}
        <circle
          cx={x}
          cy={y}
          r={isLeaf ? 6 : 4}
          fill={node.isNovel ? "#06b6d4" : isLeaf ? "#10b981" : "#374151"}
          stroke={selectedNode?.id === node.id ? "#fbbf24" : "#6b7280"}
          strokeWidth={selectedNode?.id === node.id ? 3 : 1}
          className="cursor-pointer hover:stroke-emerald-400 transition-colors"
          onClick={() => setSelectedNode(node)}
        />

        {/* Node label */}
        {isLeaf && (
          <text
            x={x + 10}
            y={y + 4}
            className="fill-emerald-400 text-xs cursor-pointer"
            onClick={() => setSelectedNode(node)}
          >
            {node.name}
          </text>
        )}

        {/* Support value */}
        {node.support && !isLeaf && (
          <text
            x={x}
            y={y - 8}
            textAnchor="middle"
            className="fill-muted-foreground text-xs"
          >
            {node.support}%
          </text>
        )}

        {/* Branch lines to children */}
        {node.children && node.children.map((child, idx) => {
          const childY = childrenY[idx];
          const childX = x + 80;
          
          return (
            <g key={child.id}>
              {/* Horizontal line to child */}
              <line
                x1={x}
                y1={y}
                x2={childX}
                y2={y}
                stroke="#6b7280"
                strokeWidth="1"
              />
              {/* Vertical line to child position */}
              <line
                x1={childX}
                y1={y}
                x2={childX}
                y2={childY}
                stroke="#6b7280"
                strokeWidth="1"
              />
              {/* Render child node */}
              {renderNode(child, childX, childY, level + 1)}
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-emerald-400" />
          Phylogenetic Relationships
        </CardTitle>
        <CardDescription>
          Evolutionary tree showing relationships between taxa clusters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tree Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 rounded-lg p-4 overflow-auto">
              <svg viewBox="0 0 800 500" className="w-full h-80">
                {renderNode(data, 50, 250, 0)}
              </svg>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-muted-foreground">Known Taxa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                <span className="text-muted-foreground">Novel Taxa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                <span className="text-muted-foreground">Internal Node</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Numbers: Bootstrap Support (%)</span>
              </div>
            </div>
          </div>

          {/* Node Details */}
          <div>
            <h4 className="text-emerald-400 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Node Information
            </h4>
            {selectedNode ? (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Node ID:</span>
                  <p className="text-sm">{selectedNode.id}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <p className="text-sm">{selectedNode.name}</p>
                </div>
                {selectedNode.classification && (
                  <div>
                    <span className="text-sm text-muted-foreground">Classification:</span>
                    <p className="text-sm">{selectedNode.classification}</p>
                  </div>
                )}
                {selectedNode.support && (
                  <div>
                    <span className="text-sm text-muted-foreground">Bootstrap Support:</span>
                    <p className="text-sm">{selectedNode.support}%</p>
                  </div>
                )}
                {selectedNode.distance && (
                  <div>
                    <span className="text-sm text-muted-foreground">Branch Length:</span>
                    <p className="text-sm">{selectedNode.distance.toFixed(4)}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <div className="mt-1">
                    {selectedNode.isNovel ? (
                      <Badge variant="outline" className="border-cyan-400/50 text-cyan-400">
                        Novel Taxa
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-400/50 text-emerald-400">
                        Known Taxa
                      </Badge>
                    )}
                  </div>
                </div>
                {selectedNode.children && (
                  <div>
                    <span className="text-sm text-muted-foreground">Children:</span>
                    <p className="text-sm">{selectedNode.children.length} descendants</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click on any node in the tree to view detailed information about its evolutionary relationships and classification.
              </p>
            )}
          </div>
        </div>

        {/* Tree Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Nodes</p>
            <p className="text-emerald-400">12</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Leaf Nodes</p>
            <p className="text-emerald-400">8</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Novel Taxa</p>
            <p className="text-cyan-400">3</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Max Depth</p>
            <p className="text-emerald-400">4</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}