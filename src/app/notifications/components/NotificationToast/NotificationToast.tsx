import { Transition } from '@headlessui/react';
import { CheckCircle, Info, Warning, WarningOctagon, X } from '@phosphor-icons/react';
import { NavLink } from 'react-router-dom';
import Spinner from '../../../shared/components/Spinner/Spinner';
import { ToastShowProps, ToastType } from '../../services/notifications.service';
import { useDispatch } from 'react-redux';
import { uiActions } from '../../../store/slices/ui';
import { useEffect } from 'react';

const NotificationToast = ({
  text,
  type,
  action,
  visible,
  closable,
  onClose,
}: Omit<ToastShowProps, 'duration'> & { visible: boolean; onClose: () => void }): JSX.Element => {
  const dispatch = useDispatch();
  let Icon: typeof CheckCircle | undefined;
  let IconColor: string | undefined;

  useEffect(() => {
    dispatch(uiActions.setIsToastNotificacionOpen(true));

    return () => {
      dispatch(uiActions.setIsToastNotificacionOpen(false));
    };
  }, []);

  switch (type) {
    case ToastType.Success:
      Icon = CheckCircle;
      IconColor = 'text-green';
      break;
    case ToastType.Error:
      Icon = WarningOctagon;
      IconColor = 'text-red-50';
      break;
    case ToastType.Info:
      Icon = Info;
      IconColor = 'text-primary';
      break;
    case ToastType.Warning:
      Icon = Warning;
      IconColor = 'text-yellow';
      break;
    case ToastType.Loading:
      IconColor = 'text-primary';
      break;
  }

  return (
    <Transition
      appear
      enter="transition ease-out duration-200"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-200"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
      show={visible}
    >
      <div
        className="flex max-w-xl items-center rounded-lg border border-gray-10 bg-white p-3 shadow-subtle-hard"
        style={{ minWidth: '300px' }}
      >
        {type === ToastType.Loading && <Spinner className="mr-1.5 h-6 w-6" />}
        {Icon && <Icon weight="fill" className={`${IconColor} mr-1.5`} size={24} />}

        <p className="flex-1 whitespace-pre break-words text-gray-80 line-clamp-2">{text}</p>
        {action &&
          (action.to ? (
            <NavLink
              className="ml-3 truncate font-medium text-primary no-underline"
              exact
              to={action.to}
              onClick={action.onClick}
            >
              {action.text}
            </NavLink>
          ) : (
            <button onClick={action.onClick} className="ml-3 truncate font-medium text-primary">
              {action.text}
            </button>
          ))}

        {closable && (
          <button onClick={onClose} className="ml-3 text-gray-40">
            <X size={20} />
          </button>
        )}
      </div>
    </Transition>
  );
};

export default NotificationToast;
