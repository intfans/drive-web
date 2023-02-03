import DeviceListItem from './DeviceListItem';
import desktopService from '../../../core/services/desktop.service';
import { Device } from '../../types';
import DriveListItemSkeleton from '../../../drive/components/DriveListItemSkeleton/DriveListItemSkeleton';
import { DriveFolderData } from '@internxt/sdk/dist/drive/storage/types';
import folderEmptyImage from 'assets/icons/light/folder-backup.svg';
import { DownloadSimple } from 'phosphor-react';
import Empty from '../../../shared/components/Empty/Empty';
import notificationsService, { ToastType } from 'app/notifications/services/notifications.service';
import { useTranslationContext } from 'app/i18n/provider/TranslationProvider';

interface Props {
  items: (Device | DriveFolderData)[];
  isLoading: boolean;
  onDeviceSelected: (device: Device | DriveFolderData) => void;
  onDeviceDeleted: (device: Device | DriveFolderData) => void;
}

const DeviceList = (props: Props): JSX.Element => {
  const { translate } = useTranslationContext();
  const { isLoading } = props;
  const getDownloadApp = async () => {
    const download = await desktopService.getDownloadAppUrl();
    return download;
  };
  const getLoadingSkeleton = () => {
    return Array(10)
      .fill(0)
      .map((n, i) => <DriveListItemSkeleton key={i} />);
  };

  const items = props.items.map((item) => (
    <DeviceListItem
      key={item.id}
      device={item}
      onClick={props.onDeviceSelected}
      onDeleteClick={props.onDeviceDeleted}
    />
  ));

  return isLoading || items.length ? (
    <div className="flex h-1 flex-grow flex-col bg-white">
      <div className="files-list flex border-b border-neutral-30 bg-white py-3 text-sm font-semibold text-neutral-400">
        <div className="box-content flex w-0.5/12 items-center justify-start pl-3"></div>
        <div className="flex flex-grow items-center px-3">{translate('backups.devices-list.columns.name')}</div>
        <div className="hidden w-2/12 items-center xl:flex"></div>
        <div className="hidden w-3/12 items-center lg:flex">
          {translate('backups.devices-list.columns.last-update')}
        </div>
        <div className="flex w-2/12 items-center">{translate('backups.devices-list.columns.size')}</div>
        <div className="flex w-1/12 items-center">{translate('backups.backups-list.columns.actions')}</div>
      </div>
      <div className="h-full overflow-y-auto">{isLoading ? getLoadingSkeleton() : items}</div>
    </div>
  ) : (
    <Empty
      icon={<img className="w-36" alt="" src={folderEmptyImage} />}
      title={translate('backups.empty.title')}
      subtitle={translate('backups.empty.subtitle')}
      action={{
        icon: DownloadSimple,
        style: 'plain',
        text: translate('backups.empty.downloadApp'),
        onClick: () => {
          getDownloadApp()
            .then((downloaded) => {
              window.open(downloaded, '_newtab' + Date.now());
            })
            .catch(() => {
              notificationsService.show({
                text: 'Something went wrong while downloading the desktop app',
                type: ToastType.Error,
              });
            });
        },
      }}
    />
  );
};

export default DeviceList;
