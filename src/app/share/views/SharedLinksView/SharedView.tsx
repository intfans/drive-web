import dateService from 'app/core/services/date.service';
import { UploadSimple, Users } from '@phosphor-icons/react';
import List from 'app/shared/components/List';
import DeleteDialog from '../../../shared/components/Dialog/Dialog';
import { useState, useEffect, useRef, useCallback } from 'react';
import iconService from 'app/drive/services/icon.service';
import shareService, { decryptMnemonic } from '../../../share/services/share.service';
import notificationsService, { ToastType } from '../../../notifications/services/notifications.service';
import _ from 'lodash';
import { ListAllSharedFoldersResponse, ListSharedItemsResponse } from '@internxt/sdk/dist/drive/share/types';
import { DriveFileData, DriveItemData } from '../../../drive/types';
import localStorageService from '../../../core/services/local-storage.service';
import sizeService from '../../../drive/services/size.service';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { storageActions } from '../../../store/slices/storage';
import { uiActions } from '../../../store/slices/ui';
import { useTranslationContext } from '../../../i18n/provider/TranslationProvider';
import {
  contextMenuDriveFolderSharedAFS,
  contextMenuDriveItemSharedAFS,
  contextMenuMultipleSharedViewAFS,
} from '../../../drive/components/DriveExplorer/DriveExplorerList/DriveItemContextMenu';
import moveItemsToTrash from '../../../../use_cases/trash/move-items-to-trash';
import MoveItemsDialog from '../../../drive/components/MoveItemsDialog/MoveItemsDialog';
import EditItemNameDialog from '../../../drive/components/EditItemNameDialog/EditItemNameDialog';
import errorService from '../../../core/services/error.service';
import ShareDialog from '../../../drive/components/ShareDialog/ShareDialog';
import Avatar from '../../../shared/components/Avatar';
import { AdvancedSharedItem, OrderBy, PreviewFileItem, SharedNamePath, UserRoles } from '../../../share/types';
import Breadcrumbs, { BreadcrumbItemData } from 'app/shared/components/Breadcrumbs/Breadcrumbs';
import { getItemPlainName } from '../../../../app/crypto/services/utils';
import Button from 'app/shared/components/Button/Button';
import storageThunks from 'app/store/slices/storage/storage.thunks';
import NameCollisionContainer from 'app/drive/components/NameCollisionDialog/NameCollisionContainer';
import ShowInvitationsDialog from 'app/drive/components/ShowInvitationsDialog/ShowInvitationsDialog';
import { sharedActions, sharedThunks } from 'app/store/slices/sharedLinks';
import { RootState } from 'app/store';
import { useHistory } from 'react-router-dom';
import navigationService from '../../../core/services/navigation.service';
import { AppView } from '../../../core/types';
import { UserSettings } from '@internxt/sdk/dist/shared/types/userSettings';
import crypto from 'crypto';

export const ITEMS_PER_PAGE = 15;

const removeDuplicates = (list: AdvancedSharedItem[]) => {
  const hash = {};
  return list.filter((obj) => {
    const key = obj.uuid ?? `${obj.id}-${obj.name}-${obj.updatedAt}-${obj.type}`;

    if (hash[key]) {
      return false;
    }
    hash[key] = true;
    return true;
  });
};

// TODO: FINISH LOGIC WHEN ADD MORE ADVANCED SHARING FEATURES
export default function SharedView(): JSX.Element {
  const { translate } = useTranslationContext();
  const dispatch = useAppDispatch();
  const isShareDialogOpen = useAppSelector((state) => state.ui.isShareDialogOpen);
  const isShowInvitationsOpen = useAppSelector((state) => state.ui.isInvitationsDialogOpen);
  const sharedNamePath = useAppSelector((state) => state.storage.sharedNamePath);
  const currentShareId = useAppSelector((state) => state.shared.currentShareId);
  const currentUserRole = useAppSelector((state: RootState) => state.shared.currentSharingRole);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const history = useHistory();

  const urlParams = new URLSearchParams(window.location.search);
  const folderUUID = urlParams.get('folderuuid');

  const [hasMoreItems, setHasMoreItems] = useState<boolean>(true);
  const [hasMoreFolders, setHasMoreFolders] = useState<boolean>(true);
  const [hasMoreRootFolders, setHasMoreRootFolders] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [orderBy, setOrderBy] = useState<OrderBy>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [shareItems, setShareItems] = useState<AdvancedSharedItem[]>([]);
  const [editNameItem, setEditNameItem] = useState<DriveItemData>();
  const [isEditNameDialogOpen, setIsEditNameDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogModalOpen, setIsDeleteDialogModalOpen] = useState<boolean>(false);
  const [currentResourcesToken, setCurrentResourcesToken] = useState<string>('');
  const [nextResourcesToken, setNextResourcesToken] = useState<string>('');
  const [user, setUser] = useState<AdvancedSharedItem['user']>();
  const [currentFolderId, setCurrentFolderId] = useState<string>('');
  const [currentParentFolderId, setCurrentParentFolderId] = useState<number>();
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const [filesOwnerCredentials, setFilesOwnerCredentials] = useState<{
    networkPass: string;
    networkUser: string;
  }>();
  const [ownerBucket, setOwnerBucket] = useState<null | string>(null);
  const [ownerEncryptionKey, setOwnerEncryptionKey] = useState<null | string>(null);
  const pendingInvitations = useAppSelector((state: RootState) => state.shared.pendingInvitations);

  useEffect(() => {
    dispatch(sharedThunks.getPendingInvitations());

    if (page === 0 && !folderUUID) {
      fetchRootFolders();
      dispatch(storageActions.resetSharedNamePath());
    }

    if (folderUUID) handleFolderAccess();
  }, []);

  useEffect(() => {
    if (!currentFolderId && !isShareDialogOpen && !folderUUID) {
      setTimeout(() => {
        resetSharedViewState();
        fetchRootFolders();
      }, 200);
    } else if (currentFolderId && !isShareDialogOpen && !folderUUID) {
      setTimeout(fetchFolders, 200);
    }
  }, [isShareDialogOpen]);

  useEffect(() => {
    if (page === 0) {
      fetchFolders();
    }
  }, [currentFolderId]);

  useEffect(() => {
    if (page === 0 && !hasMoreFolders) {
      fetchFiles();
    }
  }, [hasMoreFolders]);

  useEffect(() => {
    if (page === 0 && !hasMoreRootFolders) {
      fetchRootFiles();
    }
  }, [hasMoreRootFolders]);

  useEffect(() => {
    if (!currentFolderId && hasMoreItems && hasMoreRootFolders && page >= 1) {
      fetchRootFolders();
    }
    if (!currentFolderId && hasMoreItems && !hasMoreRootFolders && page >= 1) {
      fetchRootFiles();
    }
    if (currentFolderId && hasMoreFolders && hasMoreItems && page >= 1) {
      fetchFolders();
    }
    if (currentFolderId && !hasMoreFolders && hasMoreItems && page >= 1) {
      fetchFiles();
    }
  }, [page]);

  const resetSharedViewState = () => {
    setPage(0);
    setShareItems([]);
    setHasMoreRootFolders(true);
    setHasMoreFolders(true);
    setHasMoreItems(true);
  };

  function onShowInvitationsModalClose() {
    resetSharedViewState();
    setCurrentFolderId('');
    fetchRootFolders();
    dispatch(sharedThunks.getPendingInvitations());
    dispatch(uiActions.setIsInvitationsDialogOpen(false));
  }

  const fetchRootFolders = async () => {
    setIsLoading(true);
    resetCurrentSharingStatus();
    setCurrentResourcesToken('');
    setNextResourcesToken('');

    try {
      const response: ListAllSharedFoldersResponse = await shareService.getAllSharedFolders(
        page,
        ITEMS_PER_PAGE,
        orderBy ? `${orderBy.field}:${orderBy.direction}` : undefined,
      );

      const folders = response.folders.map((folder) => {
        const shareItem = folder as AdvancedSharedItem;
        shareItem.isFolder = true;
        shareItem.isRootLink = true;
        shareItem.name = getItemPlainName(shareItem as unknown as DriveItemData);
        shareItem.credentials = { user: response.credentials.networkUser, pass: response.credentials.networkPass };
        return shareItem;
      });

      let items;

      if (page === 0) {
        items = [...folders];
      } else {
        items = [...shareItems, ...folders];
      }

      setShareItems(items);

      if (folders.length < ITEMS_PER_PAGE) {
        setPage(0);
        setHasMoreRootFolders(false);
      }
    } catch (error) {
      errorService.reportError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRootFiles = async () => {
    setIsLoading(true);

    try {
      const response: ListAllSharedFoldersResponse = await shareService.getAllSharedFiles(
        page,
        ITEMS_PER_PAGE,
        orderBy ? `${orderBy.field}:${orderBy.direction}` : undefined,
      );

      const files = response.files.map((file) => {
        const shareItem = file as AdvancedSharedItem;
        shareItem.isFolder = false;
        shareItem.isRootLink = true;
        shareItem.name = getItemPlainName(shareItem as unknown as DriveItemData);
        shareItem.credentials = {
          user: response.credentials.networkUser,
          pass: response.credentials.networkPass,
        };
        return shareItem;
      });

      const items = [...shareItems, ...files];

      setShareItems(items);

      if (files.length < ITEMS_PER_PAGE) {
        setHasMoreItems(false);
      }
    } catch (error) {
      errorService.reportError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolders = async () => {
    if (currentFolderId && hasMoreFolders) {
      setIsLoading(true);
      try {
        const response: ListSharedItemsResponse & { role: string } = (await shareService.getSharedFolderContent(
          currentFolderId,
          'folders',
          currentResourcesToken,
          page,
          ITEMS_PER_PAGE,
          orderBy ? `${orderBy.field}:${orderBy.direction}` : undefined,
        )) as ListSharedItemsResponse & { role: string };

        const token = response.token;
        setNextResourcesToken(token);

        if (response.role) dispatch(sharedActions.setCurrentSharingRole(response.role.toLowerCase()));

        const folders = response.items.map((folder) => {
          const shareItem = folder as AdvancedSharedItem;
          shareItem.isFolder = true;
          shareItem.isRootLink = false;
          shareItem.name = getItemPlainName(shareItem as unknown as DriveItemData);
          shareItem.credentials = { user: response.credentials.networkUser, pass: response.credentials.networkPass };
          return shareItem;
        });

        let items;

        if (page === 0) {
          items = [...folders];
        } else {
          items = [...shareItems, ...folders];
        }

        setShareItems(items);

        if (folders.length < ITEMS_PER_PAGE) {
          setPage(0);
          setHasMoreFolders(false);
        }
      } catch (error) {
        errorService.reportError(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fetchFiles = async (forceFetch?: boolean) => {
    if (currentFolderId && !hasMoreFolders && (hasMoreItems || forceFetch)) {
      setIsLoading(true);
      try {
        const response: ListSharedItemsResponse & { bucket: string; encryptionKey: string } =
          (await shareService.getSharedFolderContent(
            currentFolderId,
            'files',
            currentResourcesToken,
            page,
            ITEMS_PER_PAGE,
            orderBy ? `${orderBy.field}:${orderBy.direction}` : undefined,
          )) as ListSharedItemsResponse & { bucket: string; encryptionKey: string };

        const token = response.token;
        setNextResourcesToken(token);

        const networkPass = response.credentials.networkPass;
        const networkUser = response.credentials.networkUser;
        setFilesOwnerCredentials({ networkPass, networkUser });
        const bucket = response.bucket;
        setOwnerBucket(bucket);
        const ownerMnemonincEncrypted = response.encryptionKey;
        setOwnerEncryptionKey(ownerMnemonincEncrypted);

        const files = response.items.map((file) => {
          const shareItem = file as AdvancedSharedItem;
          shareItem.isFolder = false;
          shareItem.isRootLink = false;
          shareItem.name = getItemPlainName(shareItem as unknown as DriveItemData);
          shareItem.credentials = { user: response.credentials.networkUser, pass: response.credentials.networkPass };
          return shareItem;
        });

        const items = [...shareItems, ...files];
        const itemsWithoutDuplicates = removeDuplicates(items);
        setShareItems(itemsWithoutDuplicates);

        if (files.length < ITEMS_PER_PAGE) {
          setHasMoreItems(false);
        }
      } catch (error) {
        errorService.reportError(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getSharingUserRole = async (sharingId: string) => {
    try {
      const role = await shareService.getUserRoleOfSharedRolder(sharingId);
      if (role.name) dispatch(sharedActions.setCurrentSharingRole(role.name.toLowerCase()));
    } catch (error) {
      errorService.reportError(error);
    }
  };

  const resetCurrentSharingStatus = () => {
    dispatch(sharedActions.setCurrentShareId(null));
    dispatch(sharedActions.setCurrentSharingRole(null));
  };

  useEffect(() => {
    if (currentShareId) {
      getSharingUserRole(currentShareId);
    } else {
      resetCurrentSharingStatus();
    }
  }, [currentShareId]);

  const onItemDoubleClicked = (shareItem: AdvancedSharedItem) => {
    if (shareItem.isFolder) {
      dispatch(
        storageActions.pushSharedNamePath({
          id: shareItem.id,
          name: shareItem.plainName,
          token: nextResourcesToken,
          uuid: shareItem.uuid,
        }),
      );

      const sharedFolderId = shareItem.uuid;

      if (shareItem.user) {
        setUser(shareItem.user);
      }

      if (shareItem.encryptionKey) {
        setEncryptionKey(shareItem.encryptionKey);
      }

      setCurrentResourcesToken(nextResourcesToken);
      setNextResourcesToken('');
      setPage(0);
      setShareItems([]);
      setHasMoreFolders(true);
      setHasMoreItems(true);
      setCurrentFolderId(sharedFolderId);
      setCurrentParentFolderId(shareItem.id);
      setSelectedItems([]);
    } else {
      openPreview(shareItem);
    }
  };

  const onNameClicked = (props) => {
    onItemDoubleClicked(props);
  };

  const onNextPage = () => {
    setPage(page + 1);
  };

  const closeConfirmDelete = () => {
    setIsDeleteDialogModalOpen(false);
  };

  const isItemSelected = (item: any) => {
    return selectedItems.some((i) => item.id === i.id);
  };

  const onOrderByChanged = (newOrderBy: OrderBy) => {
    setPage(0);
  };

  const deleteShareLink = async (shareId: string) => {
    //TODO check if its deleted correctly
    //setShareItems((items) => items.filter((item) => item.id !== shareId));
    //setSelectedItems((items) => items.filter((item) => item.id !== shareId));
    return await shareService.deleteShareLink(shareId);
  };

  const onDeleteSelectedItems = async () => {
    if (selectedItems.length > 0) {
      setIsLoading(true);

      const CHUNK_SIZE = 10;
      const chunks = _.chunk(selectedItems, CHUNK_SIZE);
      for (const chunk of chunks) {
        const promises = chunk.map((item) => deleteShareLink(item.id));
        await Promise.all(promises);
      }

      const stringLinksDeleted =
        selectedItems.length > 1
          ? translate('shared-links.toast.links-deleted')
          : translate('shared-links.toast.link-deleted');
      notificationsService.show({ text: stringLinksDeleted, type: ToastType.Success });
      closeConfirmDelete();
      setIsLoading(false);
    }
  };

  const onSelectedItemsChanged = (changes: { props: any; value: boolean }[]) => {
    let updatedSelectedItems = selectedItems;

    for (const change of changes) {
      updatedSelectedItems = updatedSelectedItems.filter((item) => item.id !== change.props.id);
      if (change.value) {
        updatedSelectedItems = [...updatedSelectedItems, change.props];
      }
    }
    setSelectedItems(updatedSelectedItems);
  };

  const copyLink = useCallback(
    (item: AdvancedSharedItem) => {
      shareService.getPublicShareLink(item.uuid as string, item.isFolder ? 'folder' : 'file');
    },
    [dispatch, sharedThunks],
  );

  const handleFolderAccess = () => {
    if (folderUUID)
      shareService
        .getSharedFolderContent(folderUUID as string, 'folders', '', 0, 15)
        .then((item) => {
          const shareItem = { plainName: (item as any).name, uuid: folderUUID, isFolder: true };
          onItemDoubleClicked(shareItem as unknown as AdvancedSharedItem);
        })
        .catch((error) => {
          if (error.status === 403) {
            notificationsService.show({ text: translate('shared.errors.notSharedFolder'), type: ToastType.Error });
          } else if (error.status === 404) {
            notificationsService.show({ text: translate('shared.errors.folderNotExists'), type: ToastType.Error });
          } else {
            notificationsService.show({ text: translate('shared.errors.generic'), type: ToastType.Error });
          }
          navigationService.push(AppView.Shared);
          fetchRootFolders();
        })
        .finally(() => {
          const currentURL = history.location.pathname;
          const nuevaURL = currentURL.replace(/folderuuid=valor&?/, '');
          history.replace(nuevaURL);
        });
  };

  const openShareAccessSettings = (shareItem: AdvancedSharedItem) => {
    {
      dispatch(storageActions.setItemToShare({ item: shareItem as unknown as DriveItemData }));
    }
    dispatch(uiActions.setIsShareDialogOpen(true));
  };

  const removeItemsFromList = () => {
    const selectedItemsIDs = new Set(selectedItems.map((selectedItem) => selectedItem.id));
    const newShareList = shareItems.filter((sharedItem) => !selectedItemsIDs.has(sharedItem.id));

    setShareItems(newShareList);
  };

  const moveSelectedItemsToTrash = async () => {
    const itemsToTrash = selectedItems.map((selectedShareItem) => ({
      ...(selectedShareItem as DriveItemData),
      isFolder: selectedShareItem.isFolder,
    }));

    await moveItemsToTrash(itemsToTrash, removeItemsFromList);
  };

  const moveToTrash = async (shareItem: AdvancedSharedItem) => {
    const itemToTrash = {
      ...(shareItem as unknown as DriveItemData),
      isFolder: shareItem.isFolder,
    };

    await moveItemsToTrash([itemToTrash], removeItemsFromList);
  };

  const onUploadFileButtonClicked = (): void => {
    errorService.addBreadcrumb({
      level: 'info',
      category: 'button',
      message: 'File upload button clicked',
      data: {
        currentFolderId: currentFolderId,
      },
    });
    fileInputRef.current?.click();
  };

  const onUploadFileInputChanged = async (e) => {
    const files = e.target.files;
    dispatch(
      storageActions.setItems({
        folderId: currentParentFolderId as number,
        items: shareItems as unknown as DriveItemData[],
      }),
    );

    if (files.length >= 1000 || !currentParentFolderId) {
      dispatch(uiActions.setIsUploadItemsFailsDialogOpen(true));
      notificationsService.show({
        text: 'The maximum is 1000 files per upload.',
        type: ToastType.Warning,
      });
      return; // Exit the function if the condition fails
    }

    const currentUser = localStorageService.getUser();
    let ownerUserAuthenticationData;

    const isSecondLevelOfFoldersOrMore = sharedNamePath.length > 2;
    const isOwnerOfFolder = filesOwnerCredentials?.networkUser === currentUser?.email;
    const token = isSecondLevelOfFoldersOrMore ? currentResourcesToken : nextResourcesToken;
    if (filesOwnerCredentials && currentUser && isOwnerOfFolder) {
      ownerUserAuthenticationData = {
        bridgeUser: filesOwnerCredentials?.networkUser,
        bridgePass: filesOwnerCredentials?.networkPass,
        encryptionKey: currentUser?.mnemonic,
        bucketId: currentUser.bucket,
        token,
      };
    } else {
      const mnemonicDecrypted = ownerEncryptionKey ? await decryptMnemonic(ownerEncryptionKey) : null;
      if (filesOwnerCredentials && mnemonicDecrypted && ownerBucket) {
        ownerUserAuthenticationData = {
          bridgeUser: filesOwnerCredentials?.networkUser,
          bridgePass: filesOwnerCredentials?.networkPass,
          encryptionKey: mnemonicDecrypted,
          bucketId: ownerBucket,
          token,
        };
      }
    }

    await dispatch(
      storageThunks.uploadSharedItemsThunk({
        files: Array.from(files),
        parentFolderId: currentParentFolderId,
        currentFolderId,
        ownerUserAuthenticationData,
        isDeepFolder: isSecondLevelOfFoldersOrMore,
      }),
    );

    setHasMoreItems(true);
    fetchFiles(true);
  };

  const downloadItem = async (shareItem: AdvancedSharedItem) => {
    try {
      if (shareItem.isRootLink) {
        const { credentials } = await shareService.getSharedFolderContent(
          // folderUUID
          shareItem.uuid,
          'files',
          '',
          0,
          ITEMS_PER_PAGE,
          orderBy ? `${orderBy.field}:${orderBy.direction}` : undefined,
        );
        await shareService.downloadSharedFiles({
          creds: {
            user: credentials.networkUser,
            pass: credentials.networkPass,
          },
          dispatch,
          selectedItems,
          encryptionKey: shareItem.encryptionKey,
        });
      } else {
        const { token } = await shareService.getSharedFolderContent(
          currentFolderId,
          'files',
          currentResourcesToken,
          0,
          ITEMS_PER_PAGE,
          orderBy ? `${orderBy.field}:${orderBy.direction}` : undefined,
        );
        await shareService.downloadSharedFiles({
          creds: shareItem.credentials,
          dispatch,
          selectedItems,
          encryptionKey: encryptionKey,
          token,
        });
      }
    } catch (err) {
      const error = errorService.castError(err);
      errorService.castError(error);
    }
  };

  const moveItem = (shareItem: AdvancedSharedItem) => {
    const itemToMove = {
      ...(shareItem as unknown as DriveItemData),
      isFolder: shareItem.isFolder,
    };
    dispatch(storageActions.setItemsToMove([itemToMove]));
    dispatch(uiActions.setIsMoveItemsDialogOpen(true));
  };

  const renameItem = (shareItem: AdvancedSharedItem) => {
    setEditNameItem(shareItem as unknown as DriveItemData);
    setIsEditNameDialogOpen(true);
  };

  const onCloseEditNameItems = (newItem?: DriveItemData) => {
    if (newItem) {
      const editNameItemUuid = newItem.uuid || '';
      setShareItems(
        shareItems.map((shareItem) => {
          const shareItemUuid = (shareItem as unknown as DriveItemData).uuid || '';
          if (
            shareItemUuid.length > 0 &&
            editNameItemUuid.length > 0 &&
            newItem.plainName &&
            shareItemUuid === editNameItemUuid
          ) {
            shareItem.plainName = newItem.plainName;
          }
          return shareItem;
        }),
      );
    }
    setIsEditNameDialogOpen(false);
    setEditNameItem(undefined);
  };

  const openPreview = async (shareItem: AdvancedSharedItem) => {
    const previewItem = shareItem as unknown as PreviewFileItem;

    const mnemonic = await decryptMnemonic(shareItem.encryptionKey ? shareItem.encryptionKey : encryptionKey);

    dispatch(uiActions.setFileViewerItem({ ...previewItem, mnemonic }));
    dispatch(uiActions.setIsFileViewerOpen(true));
  };

  const isItemOwnedByCurrentUser = () => {
    const currentUser = localStorageService.getUser();
    if (currentUser?.uuid && user?.uuid) {
      return currentUser.uuid === user.uuid;
    }
    return false;
  };

  const isCurrentUserViewer = useCallback(() => {
    return currentUserRole === UserRoles.Reader;
  }, [currentUserRole]);

  const skinSkeleton = [
    <div className="flex flex-row items-center space-x-4">
      <div className="h-8 w-8 rounded-md bg-gray-5" />
      <div className="h-4 w-40 rounded bg-gray-5" />
    </div>,
    <div className="h-4 w-20 rounded bg-gray-5" />,
    <div className="h-4 w-24 rounded bg-gray-5" />,
    <div className="h-4 w-20 rounded bg-gray-5" />,
  ];

  const emptyState = (
    <div className="h-full w-full p-8">
      <div className="flex h-full flex-col items-center justify-center pb-20">
        <div className="pointer-events-none mx-auto mb-10 w-max">
          <Users size={80} weight="thin" />
        </div>
        <div className="pointer-events-none text-center">
          <p className="mb-1 block text-2xl font-medium text-gray-100">{translate('shared-links.empty-state.title')}</p>
          <p className="block max-w-xs text-lg text-gray-60">{translate('shared-links.empty-state.subtitle')}</p>
        </div>
      </div>
    </div>
  );

  const goToFolderBredcrumb = (id, name, uuid, token?) => {
    setHasMoreFolders(true);
    setHasMoreItems(true);
    setShareItems([]);
    setSelectedItems([]);
    setCurrentResourcesToken(token);
    if (id === 1) {
      setCurrentFolderId('');
    } else {
      setCurrentFolderId(uuid);
    }
    setPage(0);
    dispatch(storageActions.popSharedNamePath({ id: id, name: name, token: token, uuid: uuid }));
  };

  const breadcrumbItems = (): BreadcrumbItemData[] => {
    const items: BreadcrumbItemData[] = [];

    items.push({
      id: 1,
      label: translate('shared-links.shared-links'),
      icon: null,
      active: true,
      isFirstPath: true,
      onClick: () => {
        setPage(0);
        setShareItems([]);
        setHasMoreRootFolders(true);
        setHasMoreFolders(true);
        setHasMoreItems(true);
        setCurrentFolderId('');
        goToFolderBredcrumb(1, translate('shared-links.shared-links'), '');
        fetchRootFolders();
      },
    });

    sharedNamePath.slice().forEach((path: SharedNamePath, i: number, namePath: SharedNamePath[]) => {
      items.push({
        id: path.id,
        label: path.name,
        icon: null,
        active: i < namePath.length - 1,
        onClick: () => goToFolderBredcrumb(path.id, path.name, path.uuid, path.token),
      });
    });

    return items;
  };

  return (
    <div
      className="flex w-full flex-shrink-0 flex-col"
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <div className="flex h-14 w-full flex-shrink-0 flex-row items-center px-5">
        <div className="flex w-full flex-row items-center">
          <Breadcrumbs items={breadcrumbItems()} />
        </div>

        <div
          className="flex flex-row items-center"
          data-tooltip-id="delete-link-tooltip"
          data-tooltip-content={translate('shared-links.item-menu.delete-link')}
          data-tooltip-place="bottom"
        >
          <input
            className="hidden"
            ref={fileInputRef}
            type="file"
            onChange={(e) => onUploadFileInputChanged(e)}
            multiple={true}
            data-test="input-file"
          />
          {!shareItems[0]?.isRootLink && currentUserRole && !isCurrentUserViewer() && (
            <Button
              variant="primary"
              className="mr-2"
              onClick={onUploadFileButtonClicked}
              disabled={shareItems[0]?.isRootLink}
            >
              <div className="flex items-center justify-center space-x-2.5">
                <div className="flex items-center space-x-2">
                  <UploadSimple size={24} />
                  <span className="font-medium">{translate('actions.upload.uploadFiles')}</span>
                </div>
              </div>
            </Button>
          )}
          {pendingInvitations.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => {
                dispatch(uiActions.setIsInvitationsDialogOpen(true));
              }}
            >
              <p className="space-x-2">
                Pending Invitations{' '}
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs text-white">
                  {pendingInvitations.length}
                </span>
              </p>
            </Button>
          )}
        </div>
      </div>
      <div className="flex h-full w-full flex-col overflow-y-auto">
        <List<any, 'updatedAt' | 'createdAt' | 'createdAt' | 'ownerId' | 'fileSize'>
          header={[
            {
              label: translate('shared-links.list.name'),
              width: 'flex-1 min-w-104 truncate flex-shrink-0 whitespace-nowrap', //flex-grow w-1
              name: 'folder',
              orderable: false,
            },
            {
              label: translate('shared-links.list.owner'),
              width: 'w-80', //w-1/12
              name: 'ownerId',
              orderable: true,
              defaultDirection: 'ASC',
            },

            {
              label: translate('shared-links.list.size'),
              width: 'w-40', //w-1.5/12
              name: 'fileSize',
              orderable: true,
              defaultDirection: 'ASC',
            },
            {
              label: translate('shared-links.list.created'),
              width: 'w-40', //w-2/12
              name: 'createdAt',
              orderable: true,
              defaultDirection: 'ASC',
            },
          ]}
          items={shareItems}
          isLoading={isLoading}
          onClick={(item) => {
            const unselectedDevices = selectedItems.map((deviceSelected) => ({ props: deviceSelected, value: false }));
            onSelectedItemsChanged([...unselectedDevices, { props: item, value: true }]);
          }}
          itemComposition={[
            (shareItem: AdvancedSharedItem) => {
              const Icon = iconService.getItemIcon(shareItem.isFolder, (shareItem as unknown as DriveFileData)?.type);
              return (
                <div className={'flex w-full flex-row items-center space-x-6 overflow-hidden'}>
                  <div className="my-5 flex h-8 w-8 flex-shrink items-center justify-center">
                    <Icon className="absolute h-8 w-8 flex-shrink-0 drop-shadow-soft filter" />
                    <div className="z-index-10 relative left-4 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary font-normal text-white shadow-subtle-hard ring-2 ring-white ring-opacity-90">
                      <Users size={12} color="white" weight="fill" />
                    </div>
                  </div>
                  <div
                    className="w-full max-w-full truncate pr-16"
                    onDoubleClick={() => onItemDoubleClicked(shareItem)}
                  >
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onNameClicked(shareItem);
                      }}
                      className="w-full max-w-full flex-1 cursor-pointer flex-row truncate whitespace-nowrap"
                      title={shareItem.plainName}
                    >
                      {shareItem.plainName}
                      {!shareItem.isFolder && shareItem.type && '.' + shareItem.type}
                    </span>
                  </div>
                </div>
              );
            },
            (shareItem: AdvancedSharedItem) => (
              <div className="flex flex-row items-center justify-center">
                <div className="mr-2">
                  <Avatar
                    diameter={28}
                    fullName={
                      shareItem.user?.name
                        ? `${shareItem.user?.name} ${shareItem.user?.lastname}`
                        : `${user?.name} ${user?.lastname}`
                    }
                    src={shareItem.user?.avatar ? shareItem.user?.avatar : null}
                  />
                </div>
                <span className={`${isItemSelected(shareItem) ? 'text-gray-100' : 'text-gray-60'}`}>
                  {shareItem.user ? (
                    <span>{`${shareItem.user?.name} ${shareItem.user?.lastname}`}</span>
                  ) : (
                    <span>{`${user?.name} ${user?.lastname}`}</span>
                  )}{' '}
                </span>
              </div>
            ),
            (shareItem: AdvancedSharedItem) =>
              shareItem.isFolder ? (
                <span className="opacity-25">—</span>
              ) : (
                <span>{`${sizeService.bytesToString(shareItem?.size ? shareItem.size : 0, false)}`}</span>
              ),
            (shareItem: AdvancedSharedItem) => (
              <span className={`${isItemSelected(shareItem) ? 'text-gray-100' : 'text-gray-60'}`}>
                {dateService.format(shareItem.createdAt, 'D MMM YYYY')}
              </span>
            ),
          ]}
          skinSkeleton={skinSkeleton}
          emptyState={emptyState}
          onNextPage={onNextPage}
          hasMoreItems={hasMoreItems}
          menu={
            selectedItems.length > 1
              ? contextMenuMultipleSharedViewAFS({
                  deleteLink: () => setIsDeleteDialogModalOpen(true),
                  downloadItem: downloadItem,
                  moveToTrash: isItemOwnedByCurrentUser() ? moveToTrash : undefined,
                })
              : selectedItems[0]?.isFolder
              ? contextMenuDriveFolderSharedAFS({
                  copyLink,
                  deleteLink: () => setIsDeleteDialogModalOpen(true),
                  openShareAccessSettings,
                  renameItem: isItemOwnedByCurrentUser() ? renameItem : undefined,
                  moveItem: isItemOwnedByCurrentUser() ? moveItem : undefined,
                  downloadItem: downloadItem,
                  moveToTrash: isItemOwnedByCurrentUser() ? moveToTrash : undefined,
                })
              : contextMenuDriveItemSharedAFS({
                  openShareAccessSettings,
                  openPreview: openPreview,
                  copyLink,
                  deleteLink: () => setIsDeleteDialogModalOpen(true),
                  renameItem: !isCurrentUserViewer() ? renameItem : undefined,
                  moveItem: isItemOwnedByCurrentUser() ? moveItem : undefined,
                  downloadItem: downloadItem,
                  moveToTrash: isItemOwnedByCurrentUser() ? moveToTrash : undefined,
                })
          }
          keyBoardShortcutActions={{
            onBackspaceKeyPressed: moveSelectedItemsToTrash,
            onRKeyPressed: () => {
              if (selectedItems.length === 1) {
                const selectedItem = selectedItems[0];
                const itemToRename = {
                  ...(selectedItem as unknown as DriveItemData),
                  name: selectedItem.plainName ? selectedItem.plainName : '',
                };
                setEditNameItem(itemToRename);
              }
            },
          }}
          selectedItems={selectedItems}
          keyboardShortcuts={['unselectAll', 'selectAll', 'multiselect']}
          //   disableKeyboardShortcuts={isUpdateLinkModalOpen}
          // onOrderByChanged={onOrderByChanged}
          // orderBy={orderBy}
          onSelectedItemsChanged={onSelectedItemsChanged}
        />
      </div>
      <MoveItemsDialog
        items={shareItems.map((shareItem) => ({
          ...(shareItem as unknown as DriveItemData),
          isFolder: shareItem.isFolder,
        }))}
        isTrash={false}
      />
      <EditItemNameDialog
        item={editNameItem}
        resourceToken={nextResourcesToken}
        isOpen={isEditNameDialogOpen}
        onClose={onCloseEditNameItems}
      />
      <NameCollisionContainer />
      {isShareDialogOpen && <ShareDialog />}
      {isShowInvitationsOpen && <ShowInvitationsDialog onClose={onShowInvitationsModalClose} />}
      <DeleteDialog
        isOpen={isDeleteDialogModalOpen && selectedItems.length > 0}
        onClose={closeConfirmDelete}
        onSecondaryAction={closeConfirmDelete}
        secondaryAction={translate('modals.removeSharedLinkModal.cancel')}
        title={
          selectedItems.length > 1
            ? translate('shared-links.item-menu.delete-links')
            : translate('shared-links.item-menu.delete-link')
        }
        subtitle={
          selectedItems.length > 1
            ? translate('modals.removeSharedLinkModal.multiSharedDescription')
            : translate('modals.removeSharedLinkModal.singleSharedDescription')
        }
        onPrimaryAction={onDeleteSelectedItems}
        primaryAction={
          selectedItems.length > 1
            ? translate('modals.removeSharedLinkModal.deleteLinks')
            : translate('modals.removeSharedLinkModal.deleteLink')
        }
        primaryActionColor="danger"
      />
    </div>
  );
}
