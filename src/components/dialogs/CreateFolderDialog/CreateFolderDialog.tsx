import { useState } from 'react';
import { connect, useSelector } from 'react-redux';

import { useAppDispatch } from '../../../store/hooks';
import BaseDialog from '../BaseDialog/BaseDialog';
import { setIsCreateFolderDialogOpen } from '../../../store/slices/ui';
import { storageSelectors, storageThunks } from '../../../store/slices/storage';
import folderService from '../../../services/folder.service';
import { IFormValues, UserSettings } from '../../../models/interfaces';
import { RootState } from '../../../store';

import './CreateFolderDialog.scss';
import AuthInput from '../../Inputs/AuthInput';
import { SubmitHandler, useForm } from 'react-hook-form';
import AuthButton from '../../Buttons/AuthButton';
import notify from '../../Notifications';

interface CreateFolderDialogProps {
  open: boolean;
  user: UserSettings | undefined;
}

const CreateFolderDialog = ({
  open,
  user
}: CreateFolderDialogProps
) => {
  const { register, formState: { errors, isValid }, handleSubmit, reset } = useForm<IFormValues>({ mode: 'onChange', defaultValues: { createFolder: '' } });
  const [isLoading, setIsLoading] = useState(false);
  const currentFolderId: number = useSelector((state: RootState) => storageSelectors.currentFolderId(state));
  const dispatch = useAppDispatch();

  const onCancel = (): void => {
    reset();
    dispatch(setIsCreateFolderDialogOpen(false));
  };

  const onSubmit: SubmitHandler<IFormValues> = async formData => {
    try {
      setIsLoading(true);
      await folderService.createFolder(!!user?.teams, currentFolderId, formData.createFolder);

      dispatch(storageThunks.fetchFolderContentThunk());
      dispatch(setIsCreateFolderDialogOpen(false));
      reset();

    } catch (err) {
      if (err.includes('already exists')) {
        notify('Folder with the same name already exists', 'error');
      } else {
        notify(err.message || err, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseDialog title="Create folder" open={open} onClose={onCancel}>
      <form onSubmit={handleSubmit(onSubmit)} className="px-12">
        <AuthInput
          placeholder='Enter folder name'
          label='createFolder'
          type={'text'}
          register={register}
          required={true}
          minLength={{ value: 1, message: 'Folder name must not be empty' }}
          error={errors.createFolder}
        />

        <div className='flex justify-center mt-3'>
          <button onClick={onCancel} className='secondary_dialog w-full mr-4'>
            Cancel
          </button>
          <AuthButton text='Create' textWhenDisabled={isValid ? 'Creating...' : 'Create'} isDisabled={isLoading || !isValid} />
        </div>
      </form>
    </BaseDialog>
  );
};

export default connect(
  (state: RootState) => ({
    user: state.user.user
  }))(CreateFolderDialog);
