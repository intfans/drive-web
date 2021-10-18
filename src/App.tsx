import { Component, createElement } from 'react';
import { Switch, Route, Redirect, Router, RouteProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

import configService from './app/core/services/config.service';
import errorService from './app/core/services/error.service';
import envService from './app/core/services/env.service';
import i18n from './app/i18n/services/i18n.service';
import { AppViewConfig } from './app/core/types';
import navigationService from './app/core/services/navigation.service';
import layouts from './app/core/layouts';
import analyticsService, { PATH_NAMES } from './app/analytics/services/analytics.service';
import { sessionActions } from './app/store/slices/session';
import { AppDispatch, RootState } from './app/store';
import { initializeUserThunk } from './app/store/slices/user';
import { uiActions } from './app/store/slices/ui';
import { DriveFileData } from './app/drive/types';
import { UserSettings } from './app/auth/types';
import views from './app/core/config/views';
import FileViewer from './app/drive/components/FileViewer/FileViewer';

interface AppProps {
  isAuthenticated: boolean;
  isInitialized: boolean;
  isFileViewerOpen: boolean;
  fileViewerItem: DriveFileData | null;
  user: UserSettings | undefined;
  dispatch: AppDispatch;
}

class App extends Component<AppProps> {
  constructor(props: AppProps) {
    super(props);
  }

  async componentDidMount(): Promise<void> {
    const currentRouteConfig: AppViewConfig | undefined = configService.getViewConfig({
      path: navigationService.history.location.pathname,
    });
    const dispatch: AppDispatch = this.props.dispatch;

    window.addEventListener('offline', () => {
      dispatch(sessionActions.setHasConnection(false));
    });
    window.addEventListener('online', () => {
      dispatch(sessionActions.setHasConnection(true));
    });

    try {
      await this.props.dispatch(
        initializeUserThunk({
          redirectToLogin: !!currentRouteConfig?.auth,
        }),
      );
    } catch (err: unknown) {
      const castedError = errorService.castError(err);

      console.log(castedError.message);
    }
  }

  get routes(): JSX.Element[] {
    const routes: JSX.Element[] = views.map((v) => {
      const viewConfig: AppViewConfig | undefined = configService.getViewConfig({ id: v.id });
      const layoutConfig = layouts.find((l) => l.id === viewConfig?.layout) || layouts[0];
      const componentProps: RouteProps = {
        exact: !!viewConfig?.exact,
        path: viewConfig?.path || '',
        render: (props) =>
          createElement(layoutConfig.component, {
            children: createElement(v.component, { ...props, ...v.componentProps }),
          }),
      };

      return <Route key={v.id} {...componentProps} />;
    });

    return routes;
  }

  render(): JSX.Element {
    const isDev = !envService.isProduction();
    const { isInitialized, isAuthenticated, isFileViewerOpen, fileViewerItem, dispatch } = this.props;
    const pathName = window.location.pathname.split('/')[1];
    let template: JSX.Element = <div></div>;

    if (window.location.pathname) {
      if (pathName === 'new' && window.location.search !== '') {
        analyticsService.page(PATH_NAMES[window.location.pathname]);
      }
    }

    if (!isAuthenticated || isInitialized) {
      template = (
        <DndProvider backend={HTML5Backend}>
          <Router history={navigationService.history}>
            {isDev && configService.getAppConfig().debug.enabled && (
              <span className="absolute text-supporting-2 font-bold text-white text-center bg-red-50 w-28 px-3.5 py-1 top-5 -right-7 tracking-wider opacity-80 transform rotate-45 z-50 pointer-events-none drop-shadow-2xl">
                {i18n.get('general.stage.development')}
              </span>
            )}

            <Switch>
              <Redirect from="//*" to="/*" />
              <Route exact path="/">
                <Redirect to="/login" />
              </Route>
              {this.routes}
            </Switch>

            <ToastContainer />

            {isFileViewerOpen && (
              <FileViewer file={fileViewerItem} onClose={() => dispatch(uiActions.setIsFileViewerOpen(false))} />
            )}
          </Router>
        </DndProvider>
      );
    }

    return template;
  }
}

export default connect((state: RootState) => ({
  isAuthenticated: state.user.isAuthenticated,
  isInitialized: state.user.isInitialized,
  isFileViewerOpen: state.ui.isFileViewerOpen,
  fileViewerItem: state.ui.fileViewerItem,
  user: state.user.user,
}))(App);
