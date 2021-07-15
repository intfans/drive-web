import { createAsyncThunk, createSlice, PayloadAction, ThunkAction } from '@reduxjs/toolkit';
import folderService from '../../services/folder.service';

interface StorageState {
  isLoading: boolean;
  isDeletingItems: boolean;
  currentFolderId: number | null;
  currentFolderBucket: string | null;
  items: any[];
  selectedItems: number[];
  itemToShareId: number;
  itemsToDeleteIds: number[];
  infoItemId: number;
  sortFunction: ((a: any, b: any) => number) | null;
}

const initialState: StorageState = {
  isLoading: false,
  isDeletingItems: false,
  currentFolderId: null,
  currentFolderBucket: null,
  items: [],
  selectedItems: [],
  itemToShareId: 0,
  itemsToDeleteIds: [],
  infoItemId: 0,
  sortFunction: null
};

export const deleteItemsThunk = createAsyncThunk(
  'storage/deleteItems',
  async (undefined, { getState }: any) => {
    const { user } = getState().user;
    const { items, itemsToDeleteIds, currentFolderId } = getState().storage;
    const itemsToDelete: any[] = items.filter(item => itemsToDeleteIds.includes(item.name));

    await folderService.deleteItems(user.teams, itemsToDelete);

    // this.getFolderContent(currentFolderId, false, true, !!user.teams);
  }
);

export const storageSlice = createSlice({
  name: 'storage',
  initialState,
  reducers: {
    setCurrentFolderId: (state: StorageState, action: PayloadAction<number>) => {
      state.currentFolderId = action.payload;
    },
    setCurrentFolderBucket: (state: StorageState, action: PayloadAction<string>) => {
      state.currentFolderBucket = action.payload;
    },
    setIsLoading: (state: StorageState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setItems: (state: StorageState, action: PayloadAction<any[]>) => {
      state.items = action.payload;
    },
    selectItem: (state: StorageState, action: PayloadAction<number>) => {
      state.selectedItems.push(action.payload);
    },
    deselectItem: (state: StorageState, action: PayloadAction<number>) => {
      state.selectedItems = state.selectedItems.filter(id => id !== action.payload);
    },
    resetSelectedItems: (state: StorageState) => {
      state.selectedItems = [];
    },
    setItemToShare: (state: StorageState, action: PayloadAction<number>) => {
      state.itemToShareId = action.payload;
    },
    setItemsToDelete: (state: StorageState, action: PayloadAction<number[]>) => {
      state.itemsToDeleteIds = action.payload;
    },
    setInfoItem: (state: StorageState, action: PayloadAction<number>) => {
      state.infoItemId = action.payload;
    },
    setSortFunction: (state: StorageState, action: PayloadAction<((a: any, b: any) => number) | null>) => {
      state.sortFunction = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteItemsThunk.pending, (state, action) => {
        state.isDeletingItems = true;
      })
      .addCase(deleteItemsThunk.fulfilled, (state, action) => {
        state.isDeletingItems = false;
      })
      .addCase(deleteItemsThunk.rejected, (state, action) => {
        state.isDeletingItems = false;
      });
  }
});

export const {
  setCurrentFolderId,
  setCurrentFolderBucket,
  setIsLoading,
  setItems,
  selectItem,
  deselectItem,
  resetSelectedItems,
  setItemToShare,
  setItemsToDelete,
  setInfoItem,
  setSortFunction
} = storageSlice.actions;

export const storageActions = storageSlice.actions;

export default storageSlice.reducer;