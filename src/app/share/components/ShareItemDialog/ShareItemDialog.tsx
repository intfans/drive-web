import UilClipboardAlt from '@iconscout/react-unicons/icons/uil-clipboard-alt';
import { useState } from 'react';
import { useEffect } from 'react';

import { generateFileKey, Network } from 'app/drive/services/network.service';
import { DriveItemData } from 'app/drive/types';
import { uiActions } from 'app/store/slices/ui';
import BaseDialog from 'app/shared/components/BaseDialog/BaseDialog';
import shareService from 'app/share/services/share.service';
import './ShareItemDialog.scss';
import { storageActions } from 'app/store/slices/storage';
import { trackShareLinkBucketIdUndefined } from 'app/analytics/services/analytics.service';
import { userThunks } from 'app/store/slices/user';
import i18n from 'app/i18n/services/i18n.service';
import notificationsService, { ToastType } from 'app/notifications/services/notifications.service';
import { items, aes } from '@internxt/lib';
import navigationService from 'app/core/services/navigation.service';
import { AppView } from 'app/core/types';
import errorService from 'app/core/services/error.service';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { referralsThunks } from 'app/store/slices/referrals';
import { ShareTypes } from '@internxt/sdk/dist/drive';
import crypto from 'crypto';

interface ShareItemDialogProps {
  item: DriveItemData;
}

const DEFAULT_VIEWS = 10;

const ShareItemDialog = ({ item }: ShareItemDialogProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const [linkToCopy, setLinkToCopy] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [numberOfAttempts, setNumberOfAttempts] = useState(DEFAULT_VIEWS);
  const isOpen = useAppSelector((state) => state.ui.isShareItemDialogOpen);
  const onClose = (): void => {
    close();
  };

  const close = () => {
    dispatch(uiActions.setIsShareItemDialogOpen(false));
    dispatch(storageActions.setItemToShare(null));
  };

  const itemFullName = items.getItemDisplayName(item);

  const handleShareLink = async (views: number) => {
    try {
      const fileId = item.fileId;

      if (!user) {
        return navigationService.push(AppView.Login);
      }

      const { bucket, mnemonic, userId, bridgeUser: email } = user;

      if (!bucket) {
        trackShareLinkBucketIdUndefined({ email });
        close();
        notificationsService.show(i18n.get('error.shareLinkMissingBucket'), ToastType.Error);
        dispatch(userThunks.logoutThunk());

        return;
      }

      let link;
      const network = new Network(email, userId, mnemonic);
      const code = crypto.randomBytes(32).toString('hex');

      if (item.isFolder) {
        const encryptedMnemonic = aes.encrypt(mnemonic, code);
        const bucketToken = await network.createFileToken(bucket, '', 'PULL');
        const payload: ShareTypes.GenerateShareFolderLinkPayload = {
          folderId: item.id,
          bucket: bucket,
          bucketToken: bucketToken,
          views: views,
          encryptedMnemonic: encryptedMnemonic,
        };
        link = await shareService.generateShareFolderLink(payload, code);
      } else {
        const { index } = await network.getFileInfo(bucket, fileId);
        const fileToken = await network.createFileToken(bucket, fileId, 'PULL');
        const fileEncryptionKey = await generateFileKey(mnemonic, bucket, Buffer.from(index, 'hex'));
        const encryptedKey = aes.encrypt(fileEncryptionKey.toString('hex'), code);
        const payload: ShareTypes.GenerateShareFileLinkPayload = {
          fileId,
          bucket,
          fileToken,
          views,
          encryptionKey: encryptedKey,
        };
        link = await shareService.generateShareFileLink(payload, code);
      }
      dispatch(referralsThunks.refreshUserReferrals());

      window.analytics.track('file-share');
      setLinkToCopy(link);
    } catch (err: unknown) {
      const castedError = errorService.castError(err);

      if (castedError.message === 'unauthenticated') {
        return navigationService.push(AppView.Login);
      }
      notificationsService.show(castedError.message, ToastType.Error);

      setLinkToCopy(i18n.get('error.unavailableLink'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const delay = setTimeout(() => {
      handleShareLink(numberOfAttempts);
    }, 750);

    return () => clearTimeout(delay);
  }, [numberOfAttempts]);

  return (
    <BaseDialog isOpen={isOpen} title={itemFullName} titleClasses="text-neutral-100 text-base" onClose={onClose}>
      <div className="share-dialog mb-8 flex flex-col">
        <hr className="border-t-1 my-6 border-neutral-40" />

        <div className="px-8">
          <p className="w-full text-center text-neutral-500">
            Share your Drive {item.isFolder ? 'folder' : 'file'} with this private link
          </p>

          <div className="mt-3 flex">
            <span className="mr-4 text-blue-60">1.</span>
            <div className="flex w-72 items-center rounded-md bg-neutral-20 px-4 py-3">
              <span className="text-sm text-neutral-500">
                Enter the number of times you'd like the link to be valid:
              </span>
              <input
                type="number"
                value={numberOfAttempts}
                min={1}
                className="input-number w-12 content-center text-blue-60"
                onChange={(e) => setNumberOfAttempts(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="mt-4 self-start">
            <span className="mr-4 text-blue-60">2.</span>
            <span className="text-neutral-500">Get link to share</span>
          </div>

          <div
            className="\ ml-8 mt-3 flex w-72 cursor-pointer
            select-text items-center justify-between rounded-md bg-neutral-20 px-4 py-2"
            onClick={() => {
              navigator.clipboard.writeText(linkToCopy);
              notificationsService.show(i18n.get('success.linkCopied'), ToastType.Info);
            }}
          >
            <span className="w-56 overflow-hidden truncate text-xs text-neutral-900">
              {isLoading ? 'Loading link...' : linkToCopy}
            </span>
            <UilClipboardAlt className="text-blue-60" />
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};

export default ShareItemDialog;
