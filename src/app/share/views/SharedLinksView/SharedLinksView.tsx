import dateService from 'app/core/services/date.service';
import BaseButton from 'app/shared/components/forms/BaseButton';
import { Trash, Link } from 'phosphor-react';
import List from 'app/shared/components/List';
import DeleteDialog from '../../../shared/components/Dialog/Dialog';
import { useState, useEffect } from 'react';
import iconService from 'app/drive/services/icon.service';
import copy from 'copy-to-clipboard';
import Empty from 'app/shared/components/Empty/Empty';
import emptyStateIcon from 'assets/icons/file-types/default.svg';
import shareService from 'app/share/services/share.service';
import notificationsService, { ToastType } from 'app/notifications/services/notifications.service';
import { ShareTypes } from '@internxt/sdk/dist/drive';
import _ from 'lodash';
import { ListShareLinksItem } from '@internxt/sdk/dist/drive/share/types';
import { DriveFileData, DriveItemData } from '../../../drive/types';
import { aes } from '@internxt/lib';
import localStorageService from 'app/core/services/local-storage.service';
import sizeService from 'app/drive/services/size.service';
import { useAppDispatch } from 'app/store/hooks';
import { storageActions } from 'app/store/slices/storage';
import { uiActions } from 'app/store/slices/ui';
import { useTranslationContext } from 'app/i18n/provider/TranslationProvider';
import { t } from 'i18next';
import {
  contextMenuDriveFolderShared,
  contextMenuDriveItemShared,
  contextMenuMultipleSharedView,
} from '../../../drive/components/DriveExplorer/DriveExplorerList/DriveItemContextMenu';
import storageThunks from '../../../store/slices/storage/storage.thunks';
import moveItemsToTrash from '../../../../use_cases/trash/move-items-to-trash';
import MoveItemsDialog from '../../../drive/components/MoveItemsDialog/MoveItemsDialog';
import EditFolderNameDialog from '../../../drive/components/EditFolderNameDialog/EditFolderNameDialog';
import EditItemNameDialog from '../../../drive/components/EditItemNameDialog/EditItemNameDialog';
import TooltipElement, { DELAY_SHOW_MS } from '../../../shared/components/Tooltip/Tooltip';

type OrderBy = { field: 'views' | 'createdAt'; direction: 'ASC' | 'DESC' } | undefined;

const REACT_APP_SHARE_LINKS_DOMAIN = process.env.REACT_APP_SHARE_LINKS_DOMAIN || window.location.origin;

function copyShareLink(type: string, code: string, token: string) {
  copy(`${REACT_APP_SHARE_LINKS_DOMAIN}/s/${type}/${token}/${code}`);
  notificationsService.show({ text: t('shared-links.toast.copy-to-clipboard'), type: ToastType.Success });
}

export default function SharedLinksView(): JSX.Element {
  const { translate } = useTranslationContext();
  const ITEMS_PER_PAGE = 50;

  const [hasMoreItems, setHasMoreItems] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [orderBy, setOrderBy] = useState<OrderBy>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedItems, setSelectedItems] = useState<(ListShareLinksItem & { code: string })[]>([]);
  const [shareLinks, setShareLinks] = useState<(ListShareLinksItem & { code: string })[]>([]);
  const [editNameItem, setEditNameItem] = useState<DriveItemData | null>(null);

  const [isDeleteDialogModalOpen, setIsDeleteDialogModalOpen] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  function closeConfirmDelete() {
    setIsDeleteDialogModalOpen(false);
  }

  function isItemSelected(item: ListShareLinksItem) {
    return selectedItems.some((i) => item.id === i.id);
  }

  useEffect(() => {
    fetchItems(page, orderBy, 'append');
  }, []);

  async function fetchItems(page: number, orderBy: OrderBy, type: 'append' | 'substitute') {
    setIsLoading(true);

    const response: ShareTypes.ListShareLinksResponse = await shareService.getAllShareLinks(
      page,
      ITEMS_PER_PAGE,
      orderBy ? `${orderBy.field}:${orderBy.direction}` : undefined,
    );
    let items = response.items.filter((shareLink) => {
      return shareLink.item != null;
    }) as (ListShareLinksItem & { code: string })[];
    if (type === 'append') {
      items = [...shareLinks, ...items];
    }
    setShareLinks(items);
    setHasMoreItems(ITEMS_PER_PAGE === response.items.length);
    setOrderBy(orderBy);
    setPage(page);

    setIsLoading(false);
  }

  function onNextPage() {
    fetchItems(page + 1, orderBy, 'append');
  }

  function onOrderByChanged(newOrderBy: OrderBy) {
    fetchItems(0, newOrderBy, 'substitute');
  }

  async function deleteShareLink(shareId: string) {
    //setShareLinks((items) => items.filter((item) => item.id !== shareId));
    //setSelectedItems((items) => items.filter((item) => item.id !== shareId));
    return await shareService.deleteShareLink(shareId);
    //TODO check if its deleted correctly
  }

  async function onDeleteSelectedItems() {
    if (selectedItems.length > 0) {
      setIsLoading(true);
      console.log('selectedItems', selectedItems.length);

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
      await fetchItems(0, orderBy, 'substitute');
      closeConfirmDelete();
      setIsLoading(false);
    }
  }

  function onSelectedItemsChanged(changes: { props: ListShareLinksItem & { code: string }; value: boolean }[]) {
    let updatedSelectedItems = selectedItems;

    for (const change of changes) {
      updatedSelectedItems = updatedSelectedItems.filter((item) => item.id !== change.props.id);
      if (change.value) {
        updatedSelectedItems = [...updatedSelectedItems, change.props];
      }
    }

    setSelectedItems(updatedSelectedItems);
  }

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
    <Empty
      icon={
        <div className="relative">
          <img className="w-36" alt="" src={emptyStateIcon} />
          <div className=" absolute -bottom-1 right-2 flex h-10 w-10 flex-col items-center justify-center rounded-full bg-primary text-white shadow-subtle-hard ring-8 ring-primary ring-opacity-10">
            <Link size={24} />
          </div>
        </div>
      }
      title={translate('shared-links.empty-state.title')}
      subtitle={translate('shared-links.empty-state.subtitle')}
    />
  );

  const copyLink = (item) => {
    const itemType = item.isFolder ? 'folder' : 'file';
    const encryptedCode = item.code || item.encryptedCode;
    const mnemonic = localStorageService.getUser()?.mnemonic;
    if (mnemonic) {
      const plainCode = aes.decrypt(encryptedCode, mnemonic);
      copyShareLink(itemType, plainCode, item.token);
    }
  };

  const openLinkSettings = (item) => {
    dispatch(storageActions.setItemToShare({ share: item, item: item.item }));
    dispatch(uiActions.setIsShareItemDialogOpen(true));
  };

  return (
    <div
      className="flex w-full flex-shrink-0 flex-col"
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      {editNameItem && (
        <EditItemNameDialog
          item={editNameItem}
          onClose={() => {
            setEditNameItem(null);
            fetchItems(0, orderBy, 'substitute');
          }}
        />
      )}
      <div className="flex h-14 w-full flex-shrink-0 flex-row items-center px-5">
        <div className="flex w-full flex-row items-center">
          <p className="text-lg">{translate('shared-links.shared-links')}</p>
        </div>

        <div
          className="flex flex-row items-center"
          data-tooltip-id="delete-link-tooltip"
          data-tooltip-content={translate('shared-links.item-menu.delete-link')}
          data-tooltip-place="bottom"
        >
          <BaseButton
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteDialogModalOpen(true);
            }}
            className="tertiary squared"
            disabled={!(selectedItems.length > 0)}
          >
            <Trash size={24} />
          </BaseButton>
          <TooltipElement id="delete-link-tooltip" delayShow={DELAY_SHOW_MS} />
        </div>
      </div>

      <div className="flex h-full w-full flex-col overflow-y-auto">
        <List<ListShareLinksItem & { code: string }, 'views' | 'createdAt'>
          header={[
            {
              label: translate('shared-links.list.link-content'),
              width: 'flex-1 min-w-104 flex-shrink-0 whitespace-nowrap', //flex-grow w-1
              name: 'item',
              orderable: false,
            },
            {
              label: translate('shared-links.list.shared'),
              width: 'w-40', //w-1/12
              name: 'views',
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
            {
              label: translate('shared-links.list.size'),
              width: 'w-40', //w-1.5/12
              name: 'fileSize',
              orderable: false,
            },
          ]}
          items={shareLinks}
          isLoading={isLoading}
          onClick={(item) => {
            const unselectedDevices = selectedItems.map((deviceSelected) => ({ props: deviceSelected, value: false }));
            onSelectedItemsChanged([...unselectedDevices, { props: item, value: true }]);
          }}
          itemComposition={[
            (props) => {
              const Icon = iconService.getItemIcon(props.isFolder, (props.item as DriveFileData).type);
              return (
                <div className={'flex w-full cursor-pointer flex-row items-center space-x-6 overflow-hidden'}>
                  <div className="my-5 flex h-8 w-8 flex-shrink items-center justify-center">
                    <Icon className="absolute h-8 w-8 flex-shrink-0 drop-shadow-soft filter" />
                    <div className="z-index-10 relative left-4 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary font-normal text-white shadow-subtle-hard ring-2 ring-white ring-opacity-90">
                      <Link size={12} color="white" />
                    </div>
                  </div>
                  <span
                    className="w-full max-w-full flex-1 flex-row truncate whitespace-nowrap pr-16"
                    title={`${(props.item as DriveFileData).name}${
                      !props.isFolder && (props.item as DriveFileData).type
                        ? `.${(props.item as DriveFileData).type}`
                        : ''
                    }`}
                  >
                    {`${(props.item as DriveFileData).name}${
                      !props.isFolder && (props.item as DriveFileData).type
                        ? `.${(props.item as DriveFileData).type}`
                        : ''
                    }`}
                  </span>
                </div>
              );
            },
            (props) => (
              <span className={`${isItemSelected(props) ? 'text-gray-100' : 'text-gray-60'}`}>{`${
                props.views
              } ${translate('shared-links.view')}`}</span>
            ),
            (props) => (
              <span className={`${isItemSelected(props) ? 'text-gray-100' : 'text-gray-60'}`}>
                {dateService.format(props.createdAt, 'D MMM YYYY')}
              </span>
            ),
            (props) =>
              props.isFolder ? (
                <span className="opacity-25">—</span>
              ) : (
                <span>{`${sizeService.bytesToString(props.fileSize ? props.fileSize : 0, false)}`}</span>
              ),
          ]}
          skinSkeleton={skinSkeleton}
          emptyState={emptyState}
          onNextPage={onNextPage}
          hasMoreItems={hasMoreItems}
          menu={
            selectedItems.length > 1
              ? contextMenuMultipleSharedView({
                  deleteLink: () => setIsDeleteDialogModalOpen(true),
                  downloadItem: () => {
                    const itemsToDownload = selectedItems.map((selectedShareLink) => ({
                      ...(selectedShareLink.item as DriveItemData),
                      isFolder: selectedShareLink.isFolder,
                    }));
                    dispatch(storageThunks.downloadItemsThunk(itemsToDownload));
                  },
                  moveToTrash: async () => {
                    const itemsToTrash = selectedItems.map((selectedShareLink) => ({
                      ...(selectedShareLink.item as DriveItemData),
                      isFolder: selectedShareLink.isFolder,
                    }));
                    await moveItemsToTrash(itemsToTrash);
                    fetchItems(page, orderBy, 'substitute');
                  },
                })
              : selectedItems[0]?.isFolder
              ? contextMenuDriveFolderShared({
                  copyLink,
                  openLinkSettings,
                  deleteLink: () => setIsDeleteDialogModalOpen(true),
                  renameItem: (shareLink) => {
                    const itemToRename = {
                      ...((shareLink as ListShareLinksItem).item as DriveItemData),
                      isFolder: shareLink.isFolder,
                    };
                    setEditNameItem(itemToRename);
                  },
                  moveItem: (shareLink) => {
                    const itemToMove = {
                      ...((shareLink as ListShareLinksItem).item as DriveItemData),
                      isFolder: shareLink.isFolder,
                    };
                    dispatch(storageActions.setItemsToMove([itemToMove]));
                    dispatch(uiActions.setIsMoveItemsDialogOpen(true));
                  },
                  downloadItem: (shareLink) => {
                    const itemToDownload = {
                      ...((shareLink as ListShareLinksItem).item as DriveItemData),
                      isFolder: shareLink.isFolder,
                    };
                    dispatch(storageThunks.downloadItemsThunk([itemToDownload]));
                  },
                  moveToTrash: async (shareLink) => {
                    const itemToTrash = {
                      ...((shareLink as ListShareLinksItem).item as DriveItemData),
                      isFolder: shareLink.isFolder,
                    };
                    await moveItemsToTrash([itemToTrash]);
                    fetchItems(page, orderBy, 'substitute');
                  },
                })
              : contextMenuDriveItemShared({
                  openPreview: (shareLink) => {
                    dispatch(uiActions.setIsFileViewerOpen(true));
                    dispatch(uiActions.setFileViewerItem((shareLink as ListShareLinksItem).item as DriveItemData));
                  },
                  copyLink,
                  openLinkSettings,
                  deleteLink: () => setIsDeleteDialogModalOpen(true),
                  renameItem: (shareLink) => {
                    const itemToRename = {
                      ...((shareLink as ListShareLinksItem).item as DriveItemData),
                      isFolder: shareLink.isFolder,
                    };
                    setEditNameItem(itemToRename);
                  },
                  moveItem: (shareLink) => {
                    const itemToMove = {
                      ...((shareLink as ListShareLinksItem).item as DriveItemData),
                      isFolder: shareLink.isFolder,
                    };
                    dispatch(storageActions.setItemsToMove([itemToMove]));
                    dispatch(uiActions.setIsMoveItemsDialogOpen(true));
                  },
                  downloadItem: (shareLink) => {
                    const itemToDownload = {
                      ...((shareLink as ListShareLinksItem).item as DriveItemData),
                      isFolder: shareLink.isFolder,
                    };
                    dispatch(storageThunks.downloadItemsThunk([itemToDownload]));
                  },
                  moveToTrash: async (shareLink) => {
                    const itemToTrash = {
                      ...((shareLink as ListShareLinksItem).item as DriveItemData),
                      isFolder: shareLink.isFolder,
                    };
                    await moveItemsToTrash([itemToTrash]);
                    fetchItems(page, orderBy, 'substitute');
                  },
                })
          }
          keyBoardShortcutActions={{
            onBackspaceKeyPressed: async () => {
              const itemsToTrash = selectedItems.map((selectedShareLink) => ({
                ...(selectedShareLink.item as DriveItemData),
                isFolder: selectedShareLink.isFolder,
              }));
              await moveItemsToTrash(itemsToTrash);
              fetchItems(page, orderBy, 'substitute');
            },
            onRKeyPressed: () => {
              if (selectedItems.length === 1) {
                const selectedItem = selectedItems[0];
                const itemToRename = {
                  ...((selectedItem as ListShareLinksItem).item as DriveItemData),
                  isFolder: selectedItem.isFolder,
                };
                setEditNameItem(itemToRename);
              }
            },
          }}
          selectedItems={selectedItems}
          keyboardShortcuts={['unselectAll', 'selectAll', 'multiselect']}
          onOrderByChanged={onOrderByChanged}
          orderBy={orderBy}
          onSelectedItemsChanged={onSelectedItemsChanged}
        />
      </div>
      <MoveItemsDialog
        items={shareLinks.map((shareLink) => ({ ...(shareLink.item as DriveItemData), isFolder: shareLink.isFolder }))}
        isTrash={false}
      />
      <EditFolderNameDialog />
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
