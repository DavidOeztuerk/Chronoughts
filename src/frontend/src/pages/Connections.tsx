import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Chip,
  Card,
  CardContent,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Hub,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  Refresh,
  Psychology,
  GridView,
  AccountTree,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AppDispatch, RootState } from '../store';
import { fetchConnections } from '../store/slices/connectionsSlice';
import { fetchThoughts } from '../store/slices/thoughtsSlice';

interface Node {
  id: string;
  label: string;
  category: string;
  importance: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface Link {
  source: string;
  target: string;
  type: string;
  strength: number;
}

const Connections: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { connections } = useSelector((state: RootState) => state.connections);
  const { thoughts } = useSelector((state: RootState) => state.thoughts);
  
  const [viewMode, setViewMode] = useState<'graph' | 'tree' | 'matrix'>('graph');
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectionFilter, setConnectionFilter] = useState('all');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    dispatch(fetchConnections({}));
    dispatch(fetchThoughts({}));
  }, [dispatch]);

  useEffect(() => {
    // Transform thoughts and connections into nodes and links
    const thoughtNodes: Node[] = thoughts.map(thought => ({
      id: thought.id,
      label: thought.title,
      category: thought.category,
      importance: thought.importance,
      x: Math.random() * 800,
      y: Math.random() * 600,
      vx: 0,
      vy: 0,
    }));

    const connectionLinks: Link[] = connections
      .filter(conn => connectionFilter === 'all' || conn.connectionType === connectionFilter)
      .map(conn => ({
        source: conn.sourceThoughtId,
        target: conn.targetThoughtId,
        type: conn.connectionType,
        strength: conn.strength || 1,
      }));

    setNodes(thoughtNodes);
    setLinks(connectionLinks);
  }, [thoughts, connections, connectionFilter]);

  useEffect(() => {
    if (viewMode === 'graph' && canvasRef.current && nodes.length > 0) {
      drawGraph();
    }
  }, [nodes, links, zoom, viewMode]);

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw links
    links.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      
      if (sourceNode && targetNode && sourceNode.x && sourceNode.y && targetNode.x && targetNode.y) {
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        
        // Color based on connection type
        switch (link.type) {
          case 'EvolvesFrom':
            ctx.strokeStyle = '#4CAF50';
            break;
          case 'Contradicts':
            ctx.strokeStyle = '#F44336';
            break;
          case 'Implements':
            ctx.strokeStyle = '#2196F3';
            break;
          default:
            ctx.strokeStyle = '#999999';
        }
        
        ctx.lineWidth = link.strength * 2;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
      }
    });

    // Draw nodes
    ctx.globalAlpha = 1;
    nodes.forEach(node => {
      if (node.x && node.y) {
        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20 + node.importance * 3, 0, 2 * Math.PI);
        
        // Color based on category
        switch (node.category) {
          case 'idea':
            ctx.fillStyle = '#667eea';
            break;
          case 'task':
            ctx.fillStyle = '#764ba2';
            break;
          case 'goal':
            ctx.fillStyle = '#f093fb';
            break;
          default:
            ctx.fillStyle = '#4facfe';
        }
        
        ctx.fill();
        
        // Node border
        ctx.strokeStyle = selectedNode === node.id ? '#FFD700' : '#FFFFFF';
        ctx.lineWidth = selectedNode === node.id ? 3 : 1;
        ctx.stroke();
        
        // Node label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label.substring(0, 15), node.x, node.y);
      }
    });

    ctx.restore();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    // Find clicked node
    const clickedNode = nodes.find(node => {
      if (!node.x || !node.y) return false;
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });

    setSelectedNode(clickedNode ? clickedNode.id : null);
  };

  const connectionTypes = ['all', 'RelatesTo', 'EvolvesFrom', 'Contradicts', 'Implements', 'GroupsWith'];

  const MatrixView = () => (
    <Box sx={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>From / To</th>
            {thoughts.map(thought => (
              <th key={thought.id} style={{ border: '1px solid #ddd', padding: 8, writingMode: 'vertical-lr' }}>
                {thought.title.substring(0, 20)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {thoughts.map(sourceThought => (
            <tr key={sourceThought.id}>
              <td style={{ border: '1px solid #ddd', padding: 8, fontWeight: 'bold' }}>
                {sourceThought.title.substring(0, 20)}
              </td>
              {thoughts.map(targetThought => {
                const connection = connections.find(
                  c => c.sourceThoughtId === sourceThought.id && c.targetThoughtId === targetThought.id
                );
                return (
                  <td key={targetThought.id} style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center' }}>
                    {connection && (
                      <Chip
                        label={connection.connectionType.substring(0, 3)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );

  const TreeView = () => (
    <Box sx={{ p: 3 }}>
      {thoughts.filter(t => !connections.some(c => c.targetThoughtId === t.id)).map(rootThought => (
        <Card key={rootThought.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Psychology sx={{ mr: 1 }} />
              <Typography variant="h6">{rootThought.title}</Typography>
            </Box>
            {renderTreeChildren(rootThought.id, 1)}
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderTreeChildren = (parentId: string, level: number): JSX.Element => {
    const children = connections.filter(c => c.sourceThoughtId === parentId);
    
    return (
      <Box sx={{ ml: level * 4 }}>
        {children.map(child => {
          const childThought = thoughts.find(t => t.id === child.targetThoughtId);
          if (!childThought) return null;
          
          return (
            <Box key={child.id} sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountTree sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">{childThought.title}</Typography>
                <Chip
                  label={child.connectionType}
                  size="small"
                  sx={{ ml: 1 }}
                  variant="outlined"
                />
              </Box>
              {renderTreeChildren(childThought.id, level + 1)}
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">
          Thought Connections
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, value) => value && setViewMode(value)}
            size="small"
          >
            <ToggleButton value="graph">
              <Hub />
            </ToggleButton>
            <ToggleButton value="tree">
              <AccountTree />
            </ToggleButton>
            <ToggleButton value="matrix">
              <GridView />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Connection Type</InputLabel>
          <Select
            value={connectionFilter}
            onChange={(e) => setConnectionFilter(e.target.value)}
            label="Connection Type"
          >
            {connectionTypes.map(type => (
              <MenuItem key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {viewMode === 'graph' && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ZoomOut />
              <Slider
                value={zoom}
                onChange={(_, value) => setZoom(value as number)}
                min={0.5}
                max={2}
                step={0.1}
                sx={{ width: 150 }}
              />
              <ZoomIn />
            </Box>
            
            <Tooltip title="Reset View">
              <IconButton onClick={() => setZoom(1)}>
                <Refresh />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Fullscreen">
              <IconButton>
                <Fullscreen />
              </IconButton>
            </Tooltip>
          </>
        )}

        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Chip label={`${nodes.length} Thoughts`} variant="outlined" />
          <Chip label={`${links.length} Connections`} variant="outlined" />
        </Box>
      </Paper>

      {/* Visualization */}
      <Paper sx={{ p: 3, minHeight: 600, position: 'relative' }}>
        {viewMode === 'graph' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ width: '100%', height: 600 }}
          >
            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: '100%', cursor: 'grab' }}
              onClick={handleCanvasClick}
            />
            
            {selectedNode && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  maxWidth: 300,
                }}
              >
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {nodes.find(n => n.id === selectedNode)?.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Category: {nodes.find(n => n.id === selectedNode)?.category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Connections: {links.filter(l => l.source === selectedNode || l.target === selectedNode).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
          </motion.div>
        )}
        
        {viewMode === 'tree' && <TreeView />}
        {viewMode === 'matrix' && <MatrixView />}

        {nodes.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Hub sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No connections found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start connecting your thoughts to see the visualization
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Connections;