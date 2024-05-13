import React, { useCallback } from 'react';
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  getSmoothStepPath,
  BaseEdge,
  useNodes,
} from 'reactflow';
import dagre from 'dagre';
import {
  SmartStepEdge,
  getSmartEdge,
  SmartStraightEdge,
  SmartBezierEdge,
} from '@tisoap/react-flow-smart-edge';

import { initialNodes, initialEdges } from './nodes-edges.js';

import 'reactflow/dist/style.css';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

// const foreignObjectSize = 200;

// { id, ...props }
const CustomEdge = props => {
  const nodes = useNodes();

  const getSmartEdgeResponse = getSmartEdge({
    ...props,
    nodes,
  });

  if (!getSmartEdgeResponse) {
    return <SmartStepEdge {...props} />;
  }

  return <SmartStepEdge {...props} />;
  /* const { edgeCenterX, edgeCenterY, svgPathString } = getSmartEdgeResponse;

  return (
    <>
      <path
        style={props.style}
        className="react-flow__edge-path"
        d={svgPathString}
        markerEnd={props.markerEnd}
        markerStart={props.markerStart}
      />
      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={edgeCenterX - foreignObjectSize / 2}
        y={edgeCenterY - foreignObjectSize / 2}
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <button
          onClick={event => {
            event.stopPropagation();
            alert(`remove ${props.id}`);
          }}
        >
          X
        </button>
      </foreignObject>
    </>
  ); */
};

const edgeTypes = {
  // custom: SmartStepEdge,
  custom: CustomEdge,
};

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 200, ranksep: 200 });

  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  initialNodes,
  initialEdges,
);

const LayoutFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onConnect = useCallback(
    params =>
      setEdges(eds =>
        addEdge(
          // { ...params, type: ConnectionLineType.SmoothStep, animated: true },
          { ...params, type: 'custom', animated: true },
          eds,
        ),
      ),
    [setEdges],
  );
  const onLayout = useCallback(
    direction => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges, setNodes, setEdges],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      // connectionLineType={ConnectionLineType.SmoothStep}
      fitView
      edgeTypes={edgeTypes}
    >
      <Panel position="top-right">
        <button onClick={() => onLayout('TB')}>vertical layout</button>
        <button onClick={() => onLayout('LR')}>horizontal layout</button>
      </Panel>
    </ReactFlow>
  );
};

export default LayoutFlow;
