import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';

import { StorageState } from '../storage.model';
import { RootState } from '../../..';
import { UrlPath } from '../../../../drive/types';
import { SdkFactory } from '../../../../core/factory/sdk';
import storageThunks from '../storage.thunks';
import { uiActions } from 'app/store/slices/ui';

export const goToUrlThunk = createAsyncThunk<void, UrlPath, { state: RootState }>(
  'storage/goToUrlThunk',
  async (path: UrlPath, { dispatch }) => {
    if (path.type === 'folder') {
      const folderId = Number(path.id);
      const storageClient = SdkFactory.getInstance().createStorageClient();
      const [responsePromise] = storageClient.getFolderContent(folderId);

      responsePromise
        .then((response) => {
          const folderName = response.name;
          dispatch(storageThunks.goToFolderThunk({ name: folderName, id: folderId }));
        })
        .catch((error) => {
          if (error.message === 'Folder not found') {
            dispatch(uiActions.setIsItemNotFoundDialogOpen(true));
          }
        });
    }

    if (path.type === 'file') {
      const fileId = String(path.id);
      const storageClient = SdkFactory.getNewApiInstance().createNewStorageClient();
      const [responsePromise] = storageClient.getFile(fileId);
      let fileItem;

      responsePromise
        .then((response) => {
          const parentId = response.folderId;
          const fileId = response.id;

          const storageClient = SdkFactory.getInstance().createStorageClient();
          const [responsePromise] = storageClient.getFolderContent(parentId);

          responsePromise.then((response) => {
            const folderName = response.name;
            fileItem = response.files.find((item) => item.id === fileId);
            dispatch(storageThunks.goToFolderThunk({ name: folderName, id: parentId }));
            dispatch(uiActions.setIsFileViewerOpen(true));
            dispatch(uiActions.setFileViewerItem(fileItem));
          });
        })
        .catch(() => {
          dispatch(uiActions.setIsItemNotFoundDialogOpen(true));
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
