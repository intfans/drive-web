import { FileExtensionGroup } from '../../../types/file-types';
import { lazy } from 'react';
const FileImageViewer = lazy(() => import('./FileImageViewer/FileImageViewer'));
const FilePdfViewer = lazy(() => import('./FilePdfViewer/FilePdfViewer'));
const FileVideoViewer = lazy(() => import('./FileVideoViewer/FileVideoViewer'));
const FileAudioViewer = lazy(() => import('./FileAudioViewer/FileAudioViewer'));

export default {
  [FileExtensionGroup.Image]: FileImageViewer,
  [FileExtensionGroup.Pdf]: FilePdfViewer,
  // [FileExtensionGroup.Video]: FileVideoViewer,
  [FileExtensionGroup.Audio]: FileAudioViewer,
};
