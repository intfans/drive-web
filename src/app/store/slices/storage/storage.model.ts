import { ShareLink } from '@internxt/sdk/dist/drive/share/types';
import { OrderDirection, OrderSettings } from '../../../core/types';
import { DriveItemData, FileViewMode, FolderPath, FolderPathDialog } from '../../../drive/types';
import { SharedNamePath } from 'app/share/types';
import { IRoot } from './storage.thunks/uploadFolderThunk';

export interface StorageFilters {
  text: string;
}

export interface StorageState {
  loadingFolders: Record<number, boolean>;
  isDeletingItems: boolean;
  levels: Record<number, DriveItemData[]>;
  levelsFoldersLength: Record<number, number>;
  levelsFilesLength: Record<number, number>;
  hasMoreDriveFolders: boolean;
  hasMoreDriveFiles: boolean;
  recents: DriveItemData[];
  isLoadingRecents: boolean;
  isLoadingDeleted: boolean;
  filters: StorageFilters;
  order: OrderSettings;
  selectedItems: DriveItemData[];
  itemToShare: { share?: ShareLink; item: DriveItemData } | null;
  itemsToDelete: DriveItemData[];
  itemsToMove: DriveItemData[];
  itemToRename: DriveItemData | null;
  itemsOnTrash: DriveItemData[];
  folderOnTrashLength: number;
  filesOnTrashLength: number;
  filesToRename: (File | DriveItemData)[];
  driveFilesToRename: DriveItemData[];
  foldersToRename: (DriveItemData | IRoot)[];
  driveFoldersToRename: DriveItemData[];
  moveDestinationFolderId: number | null;
  viewMode: FileViewMode;
  namePath: FolderPath[];
  folderPathDialog: FolderPathDialog[];
  driveItemsSort: string;
  driveItemsOrder: string;
  sharedNamePath: SharedNamePath[];
  currentPath: FolderPath;
}

export interface StorageSetFiltersPayload {
  text?: string;
}

export function filtersFactory(): StorageFilters {
  return {
    text: '',
  };
}

export function orderFactory(by: string, direction: OrderDirection): OrderSettings {
  return {
    by,
    direction,
  };
}
