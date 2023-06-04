import { uiActions } from 'app/store/slices/ui';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { RootState } from 'app/store';
import Modal from 'app/shared/components/Modal';
import { useTranslationContext } from 'app/i18n/provider/TranslationProvider';
import { WarningCircle } from 'phosphor-react';

interface itemNotFoundDialogProps {
  itemType: string;
}

const ItemNotFoundDialog = (props: itemNotFoundDialogProps): JSX.Element => {
  const { translate } = useTranslationContext();
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state: RootState) => state.ui.isItemNotFoundDialogOpen);

  const onClose = (): void => {
    window.history.pushState(null, '', '/drive');
    dispatch(uiActions.setIsItemNotFoundDialogOpen(false));
  };

  return (
    <Modal maxWidth="max-w-sm" isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center px-3 pb-3">
        <WarningCircle size={52} className="my-5 text-red-std" weight="thin" />
        <p className="text-xl font-medium text-gray-100">
          {props.itemType === 'folder'
            ? translate('drive.itemNotFoundDialog.folderTitle')
            : translate('drive.itemNotFoundDialog.fileTitle')}
        </p>
        <p className="font-regular mt-1 text-center text-base text-gray-60">
          {props.itemType === 'folder'
            ? translate('drive.itemNotFoundDialog.folderText')
            : translate('drive.itemNotFoundDialog.fileText')}
        </p>
      </div>
    </Modal>
  );
};

export default ItemNotFoundDialog;
