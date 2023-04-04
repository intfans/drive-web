import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ReactComponent as Logo } from 'assets/icons/brand/x-white.svg';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { userThunks } from '../../../store/slices/user';
import desktopService from '../../../core/services/desktop.service';
import bg from 'assets/images/shared-file/bg.png';
import Shield from 'assets/images/shared-file/icons/shield.png';
import EndToEnd from 'assets/images/shared-file/icons/end-to-end.png';
import Lock from 'assets/images/shared-file/icons/lock.png';
import EyeSlash from 'assets/images/shared-file/icons/eye-slash.png';
import '../../../share/views/ShareView/ShareView.scss';
import notificationsService, { ToastType } from 'app/notifications/services/notifications.service';
import { useTranslationContext } from 'app/i18n/provider/TranslationProvider';
import Button from 'app/shared/components/Button/Button';
import { DotsThree, Link as LinkIcon, SignIn, UserPlus } from 'phosphor-react';
interface ShareLayoutProps {
  children: JSX.Element;
}

export default function ShareLayout(props: ShareLayoutProps): JSX.Element {
  const { translate } = useTranslationContext();
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();

  const getAvatarLetters = () => {
    const initials = user && `${user['name'].charAt(0)}${user['lastname'].charAt(0)}`.toUpperCase();

    return initials;
  };

  const getDownloadApp = async () => {
    const download = await desktopService.getDownloadAppUrl();
    return download;
  };

  const downloadDesktopApp = () => {
    getDownloadApp()
      .then((download) => {
        window.open(download, '_self');
      })
      .catch(() => {
        notificationsService.show({
          text: 'Something went wrong while downloading the desktop app',
          type: ToastType.Error,
        });
      });
  };

  const logout = () => {
    dispatch(userThunks.logoutThunk());
  };

  const copyNavigatorLink = () => {
    navigator.clipboard.writeText(window.location.href);
    notificationsService.show({ text: translate('success.linkCopied'), type: ToastType.Success });
  };

  return (
    <>
      {/* Content */}
      <div className="flex h-screen flex-row items-stretch justify-center bg-white text-cool-gray-90">
        {/* Banner */}
        <div className="relative hidden h-full w-96 flex-shrink-0 flex-col bg-blue-80 text-white lg:flex">
          <img src={bg} className="absolute top-0 left-0 h-full w-full object-cover object-center" />

          <div className="z-10 flex h-full flex-col space-y-12 p-12">
            <div className="relative flex flex-row items-center space-x-2 font-semibold">
              <Logo className="h-4 w-4" />
              <span>INTERNXT</span>
            </div>

            <div className="flex h-full flex-col justify-center space-y-20">
              <div className="flex flex-col space-y-2">
                <span className="text-xl opacity-60">{translate('shareLayout.title')}</span>
                <p className="text-3xl font-semibold leading-none">{translate('shareLayout.subtitle')}</p>
              </div>

              <div className="flex flex-col space-y-3 text-xl">
                {[
                  { icon: Shield, label: translate('shareLayout.labels.privacy') },
                  { icon: EndToEnd, label: translate('shareLayout.labels.end-to-end') },
                  { icon: Lock, label: translate('shareLayout.labels.military-grade') },
                  { icon: EyeSlash, label: translate('shareLayout.labels.zero-knowledge') },
                ].map((item) => (
                  <div className="flex flex-row items-center space-x-3" key={item.icon}>
                    <img src={item.icon} className="h-6 w-6" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {!isAuthenticated && (
              <a href="https://internxt.com" className="no-underline" target="_blank" rel="noopener noreferrer">
                <div
                  className="flex cursor-pointer flex-row items-center justify-center rounded-xl p-1 no-underline
                                ring-3 ring-blue-30"
                >
                  <div
                    className="flex h-12 w-full flex-row items-center justify-center rounded-lg bg-white
                                  px-6 text-xl font-semibold text-blue-70 no-underline"
                  >
                    <span>{translate('shareLayout.tryInternxt')}</span>
                  </div>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Download container */}
        <div className="flex flex-1 flex-col">
          {/* Top bar */}
          <div className="flex h-20 flex-shrink-0 flex-row items-center justify-end px-6">
            {isAuthenticated ? (
              <>
                {/* User avatar */}
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <Menu.Button
                      className="focus:outline-none inline-flex w-full justify-center rounded-lg px-4
                                              py-2 font-medium focus-visible:ring-2
                                              focus-visible:ring-blue-20 focus-visible:ring-opacity-75"
                    >
                      <div className="flex flex-row space-x-3">
                        <div
                          className="flex h-8 w-8 flex-row items-center justify-center
                                        rounded-full bg-blue-10 text-blue-80"
                        >
                          <span className="text-sm font-semibold">{getAvatarLetters()}</span>
                        </div>
                        <div className="flex flex-row items-center font-semibold">
                          <span>{`${user && user['name']} ${user && user['lastname']}`}</span>
                        </div>
                      </div>
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items
                      className="focus:outline-none absolute right-0 origin-top-right whitespace-nowrap rounded-md bg-white
                                            p-1 shadow-lg ring-1 ring-cool-gray-100 ring-opacity-5
                                            "
                    >
                      <Menu.Item>
                        {({ active }) => (
                          <Link to="/app" className="text-cool-gray-90 no-underline hover:text-cool-gray-90">
                            <button
                              className={`${active && 'bg-cool-gray-5'} group flex w-full items-center rounded-md
                                            px-4 py-2 font-medium`}
                            >
                              {translate('shareLayout.topBar.drive')}
                            </button>
                          </Link>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => {
                              downloadDesktopApp();
                            }}
                            className={`${active && 'bg-cool-gray-5'} group flex w-full items-center rounded-md
                                            px-4 py-2 font-medium`}
                          >
                            {translate('shareLayout.topBar.downloadApp')}
                          </button>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => {
                              logout();
                            }}
                            className={`${active && 'bg-red-10 bg-opacity-50 text-red-60'} group flex w-full
                                            items-center rounded-md px-4 py-2 font-medium`}
                          >
                            {translate('shareLayout.topBar.logout')}
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <>
                {/* Login / Create account */}
                <div className="flex flex-row space-x-3">
                  <button
                    onClick={copyNavigatorLink}
                    title={translate('actions.copyLink')}
                    className="outline-none flex hidden cursor-pointer flex-row items-center justify-center rounded-lg bg-white bg-opacity-0 font-medium transition duration-50 ease-in-out hover:bg-opacity-10 focus:bg-opacity-5 focus-visible:bg-opacity-5 sm:block"
                  >
                    <LinkIcon size={20} />
                  </button>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      window.location.href = process.env.REACT_APP_HOSTNAME + '/login';
                    }}
                    className="hidden px-5 sm:block"
                  >
                    {translate('auth.login.title')}
                  </Button>
                  <Button
                    variant="primary"
                    type="button"
                    onClick={() => {
                      window.open(`${process.env.REACT_APP_HOSTNAME}/new`, '_blank');
                    }}
                    className="hidden px-5 sm:block"
                  >
                    {translate('auth.login.createAccount')}
                  </Button>
                  <Menu as="div" className="relative inline-block text-left sm:hidden">
                    <Menu.Button className="outline-none flex h-11 w-11 cursor-pointer flex-row items-center justify-center rounded-lg bg-white bg-opacity-0 font-medium transition duration-50 ease-in-out hover:bg-opacity-10 focus:bg-opacity-5 focus-visible:bg-opacity-5">
                      <DotsThree weight="bold" size={20} />
                    </Menu.Button>
                    <Transition
                      className={'flex'}
                      enter="transform transition duration-100 ease-out"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="transform transition duration-100 ease-out"
                      leaveFrom="scale-95 opacity-100"
                      leaveTo="scale-100 opacity-0"
                    >
                      <Menu.Items
                        className={
                          'outline-none absolute right-0 mt-1 w-56 origin-top-right rounded-md border border-black border-opacity-8 bg-white py-1.5 text-base shadow-subtle-hard'
                        }
                      >
                        <>
                          <Menu.Item>
                            {({ active }) => (
                              <div
                                onClick={copyNavigatorLink}
                                className={`${
                                  active && 'bg-gray-5'
                                } flex cursor-pointer items-center py-2 px-3 text-gray-80 hover:bg-gray-5`}
                              >
                                <LinkIcon size={20} />
                                <p className="ml-3">{translate('drive.dropdown.getLink')}</p>
                              </div>
                            )}
                          </Menu.Item>
                          <div className="my-0.5 mx-3 border-t border-gray-10" />
                          <Menu.Item>
                            {({ active }) => (
                              <div
                                onClick={() => {
                                  window.location.href = process.env.REACT_APP_HOSTNAME + '/login';
                                }}
                                className={`${
                                  active && 'bg-gray-5'
                                } flex cursor-pointer items-center py-2 px-3 text-gray-80 hover:bg-gray-5`}
                              >
                                <SignIn size={20} />
                                <p className="ml-3">{translate('auth.login.title')}</p>
                              </div>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <div
                                onClick={() => {
                                  window.open(`${process.env.REACT_APP_HOSTNAME}/new`, '_blank');
                                }}
                                className={`${
                                  active && 'bg-gray-5'
                                } flex cursor-pointer items-center py-2 px-3 text-gray-80 hover:bg-gray-5`}
                              >
                                <UserPlus size={20} />
                                <p className="ml-3">{translate('auth.login.createAccount')}</p>
                              </div>
                            )}
                          </Menu.Item>
                        </>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </>
            )}
          </div>

          {/* File container */}
          <div className="mb-20 flex h-full flex-col items-center justify-center space-y-10">{props.children}</div>
        </div>
      </div>
    </>
  );
}
