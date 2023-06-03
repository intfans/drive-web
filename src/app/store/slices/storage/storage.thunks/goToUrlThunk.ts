import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';

import { StorageState } from '../storage.model';
import { RootState } from '../../..';
import { UrlPath } from '../../../../drive/types';
import { SdkFactory } from '../../../../core/factory/sdk';
import storageThunks from '../storage.thunks';

export const goToUrlThunk = createAsyncThunk<void, UrlPath, { state: RootState }>(
  'storage/goToUrlThunk',
  async (path: UrlPath, { getState, dispatch }) => {
    if (path.type === 'folder') {
      const folderId = Number(path.id);
      const storageClient = SdkFactory.getInstance().createStorageClient();
      const [responsePromise] = storageClient.getFolderContent(folderId);

      responsePromise.then((response) => {
        const folderName = response.name;
        dispatch(storageThunks.goToFolderThunk({ name: folderName, id: folderId }));
      });
    }
  },
);

export const goToUrlThunkExtraReducers = (builder: ActionReducerMapBuilder<StorageState>): void => {
  builder
    .addCase(goToUrlThunk.pending, () => undefined)
    .addCase(goToUrlThunk.fulfilled, () => undefined)
    .addCase(goToUrlThunk.rejected, () => undefined);
};
