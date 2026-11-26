import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ThoughtConnection, ThoughtConnectionRequest, Thought } from '../../types';
import api from '../../services/api';

export interface ConnectionsState {
  connections: ThoughtConnection[];
  relatedThoughts: Thought[];
  loading: boolean;
  error: string | null;
}

const initialState: ConnectionsState = {
  connections: [],
  relatedThoughts: [],
  loading: false,
  error: null,
};

export const fetchConnections = createAsyncThunk(
  'connections/fetchAll',
  async (filters?: { thoughtId?: string }) => {
    if (filters?.thoughtId) {
      const connections = await api.getConnections(filters.thoughtId);
      return connections;
    }
    // For now, return empty array when no thoughtId is provided
    // In a real app, you'd have an endpoint to fetch all connections
    return [];
  }
);

export const fetchConnectionsByThought = createAsyncThunk(
  'connections/fetchByThought',
  async (thoughtId: string) => {
    const connections = await api.getConnections(thoughtId);
    return connections;
  }
);

export const createConnection = createAsyncThunk(
  'connections/create',
  async (data: ThoughtConnectionRequest) => {
    const connection = await api.createConnection(data);
    return connection;
  }
);

export const deleteConnection = createAsyncThunk(
  'connections/delete',
  async (id: string) => {
    await api.deleteConnection(id);
    return id;
  }
);

export const fetchRelatedThoughts = createAsyncThunk(
  'connections/fetchRelated',
  async ({ thoughtId, maxDepth = 1 }: { thoughtId: string; maxDepth?: number }) => {
    const thoughts = await api.getRelatedThoughts(thoughtId, maxDepth);
    return thoughts;
  }
);

const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    clearConnections: (state) => {
      state.connections = [];
      state.relatedThoughts = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch all connections
    builder
      .addCase(fetchConnections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.loading = false;
        state.connections = action.payload;
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch connections';
      });

    // Fetch connections by thought
    builder
      .addCase(fetchConnectionsByThought.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConnectionsByThought.fulfilled, (state, action) => {
        state.loading = false;
        state.connections = action.payload;
      })
      .addCase(fetchConnectionsByThought.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch connections';
      });

    // Create connection
    builder
      .addCase(createConnection.fulfilled, (state, action) => {
        state.connections.push(action.payload);
      });

    // Delete connection
    builder
      .addCase(deleteConnection.fulfilled, (state, action) => {
        state.connections = state.connections.filter(c => c.id !== action.payload);
      });

    // Fetch related thoughts
    builder
      .addCase(fetchRelatedThoughts.fulfilled, (state, action) => {
        state.relatedThoughts = action.payload;
      });
  },
});

export const { clearConnections } = connectionsSlice.actions;
export default connectionsSlice.reducer;