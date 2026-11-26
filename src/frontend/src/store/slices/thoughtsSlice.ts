import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Thought, ThoughtRequest } from '../../types';
import api from '../../services/api';

export interface ThoughtsState {
  thoughts: Thought[];
  currentThought: Thought | null;
  loading: boolean;
  error: string | null;
  stats?: {
    totalThoughts?: number;
    totalConnections?: number;
    activeTasks?: number;
    weeklyThoughts?: number;
    completedTasks?: number;
    activeDays?: number;
    monthlyThoughts?: number;
    categoriesCount?: Record<string, number>;
    tagsCount?: Record<string, number>;
    averageImportance?: number;
  };
  activity: any[];
  filter: {
    category?: string;
    tag?: string;
    searchTerm?: string;
  };
}

const initialState: ThoughtsState = {
  thoughts: [],
  currentThought: null,
  loading: false,
  error: null,
  stats: {},
  activity: [],
  filter: {},
};

export const fetchThoughts = createAsyncThunk(
  'thoughts/fetchAll',
  async (filters?: { category?: string; tag?: string; searchText?: string; limit?: number }) => {
    const thoughts = await api.getThoughts(filters);
    return thoughts;
  }
);

export const fetchThought = createAsyncThunk(
  'thoughts/fetchOne',
  async (id: string) => {
    const thought = await api.getThought(id);
    return thought;
  }
);

export const createThought = createAsyncThunk(
  'thoughts/create',
  async (data: ThoughtRequest) => {
    const thought = await api.createThought(data);
    return thought;
  }
);

export const updateThought = createAsyncThunk(
  'thoughts/update',
  async ({ id, data }: { id: string; data: ThoughtRequest }) => {
    const thought = await api.updateThought(id, data);
    return thought;
  }
);

export const deleteThought = createAsyncThunk(
  'thoughts/delete',
  async (id: string) => {
    await api.deleteThought(id);
    return id;
  }
);

export const fetchStats = createAsyncThunk(
  'thoughts/fetchStats',
  async () => {
    const stats = await api.getStats();
    return stats;
  }
);

export const fetchActivity = createAsyncThunk(
  'thoughts/fetchActivity',
  async (limit: number = 10) => {
    const activity = await api.getRecentActivity(limit);
    return activity;
  }
);

const thoughtsSlice = createSlice({
  name: 'thoughts',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<typeof initialState.filter>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearCurrentThought: (state) => {
      state.currentThought = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    fetchThoughtById: (state, action: PayloadAction<string>) => {
      const thought = state.thoughts.find(t => t.id === action.payload);
      if (thought) {
        state.currentThought = thought;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch all thoughts
    builder
      .addCase(fetchThoughts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThoughts.fulfilled, (state, action) => {
        state.loading = false;
        state.thoughts = action.payload;
      })
      .addCase(fetchThoughts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch thoughts';
      });

    // Fetch single thought
    builder
      .addCase(fetchThought.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThought.fulfilled, (state, action) => {
        state.loading = false;
        state.currentThought = action.payload;
      })
      .addCase(fetchThought.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch thought';
      });

    // Create thought
    builder
      .addCase(createThought.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createThought.fulfilled, (state, action) => {
        state.loading = false;
        state.thoughts.unshift(action.payload);
      })
      .addCase(createThought.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create thought';
      });

    // Update thought
    builder
      .addCase(updateThought.fulfilled, (state, action) => {
        const index = state.thoughts.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.thoughts[index] = action.payload;
        }
        if (state.currentThought?.id === action.payload.id) {
          state.currentThought = action.payload;
        }
      });

    // Delete thought
    builder
      .addCase(deleteThought.fulfilled, (state, action) => {
        state.thoughts = state.thoughts.filter(t => t.id !== action.payload);
        if (state.currentThought?.id === action.payload) {
          state.currentThought = null;
        }
      });

    // Fetch stats
    builder
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state) => {
        state.stats = {};
      });

    // Fetch activity
    builder
      .addCase(fetchActivity.fulfilled, (state, action) => {
        state.activity = action.payload;
      })
      .addCase(fetchActivity.rejected, (state) => {
        state.activity = [];
      });
  },
});

export const { setFilter, clearCurrentThought, clearError, fetchThoughtById } = thoughtsSlice.actions;
export default thoughtsSlice.reducer;