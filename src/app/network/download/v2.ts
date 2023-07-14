import { Network } from '@internxt/sdk/dist/network';
import { sha256 } from '../crypto';
import { NetworkFacade } from '../NetworkFacade';
import { binaryStreamToBlob } from 'app/core/services/stream.service';

type DownloadProgressCallback = (totalBytes: number, downloadedBytes: number) => void;
type FileStream = ReadableStream<Uint8Array>;
type DownloadFileResponse = Promise<FileStream>;
type DownloadFileOptions = { notifyProgress: DownloadProgressCallback; abortController?: AbortController };
interface NetworkCredentials {
  user: string;
  pass: string;
}

interface DownloadFileParams {
  bucketId: string;
  fileId: string;
  options?: DownloadFileOptions;
}

interface DownloadOwnFileParams extends DownloadFileParams {
  creds: NetworkCredentials;
  mnemonic: string;
  token?: never;
  encryptionKey?: never;
}

interface DownloadSharedFileParams extends DownloadFileParams {
  creds?: never;
  mnemonic?: never;
  token: string;
  encryptionKey: string;
}

type DownloadSharedFileFunction = (params: DownloadSharedFileParams) => DownloadFileResponse;
type DownloadOwnFileFunction = (params: DownloadOwnFileParams) => DownloadFileResponse;
type DownloadFileFunction = (params: DownloadSharedFileParams | DownloadOwnFileParams) => DownloadFileResponse;

const downloadSharedFile: DownloadSharedFileFunction = (params) => {
  const { bucketId, fileId, encryptionKey, token, options } = params;

  return new NetworkFacade(
    Network.client(
      process.env.REACT_APP_STORJ_BRIDGE as string,
      {
        clientName: 'drive-web',
        clientVersion: '1.0',
      },
      {
        bridgeUser: '',
        userId: '',
      },
    ),
  ).download(bucketId, fileId, '', {
    key: Buffer.from(encryptionKey, 'hex'),
    token,
    downloadingCallback: options?.notifyProgress,
    abortController: options?.abortController,
  });
};

function getAuthFromCredentials(creds: NetworkCredentials): { username: string; password: string } {
  return {
    username: creds.user,
    password: sha256(Buffer.from(creds.pass)).toString('hex'),
  };
}

const downloadOwnFile: DownloadOwnFileFunction = (params) => {
  const { bucketId, fileId, mnemonic, options } = params;
  const auth = getAuthFromCredentials(params.creds);

  return new NetworkFacade(
    Network.client(
      process.env.REACT_APP_STORJ_BRIDGE as string,
      {
        clientName: 'drive-web',
        clientVersion: '1.0',
      },
      {
        bridgeUser: auth.username,
        userId: auth.password,
      },
    ),
  ).download(bucketId, fileId, mnemonic, {
    downloadingCallback: options?.notifyProgress,
    abortController: options?.abortController,
  });
};

const downloadFile: DownloadFileFunction = async (params) => {
  const videoPlayer = document.getElementById('video-Inxt');
  let stream: FileStream;

  if (params.token && params.encryptionKey) {
    stream = await downloadSharedFile(params);
  } else if (params.creds && params.mnemonic) {
    stream = await downloadOwnFile(params);
  } else {
    throw new Error('DOWNLOAD ERRNO. 0');
  }

  await addFileToVideoPlayer(videoPlayer, stream);
  return new ReadableStream();
};

async function addFileToVideoPlayer(videoPlayer, stream: FileStream) {
  const mediaSource = new MediaSource();
  videoPlayer.src = URL.createObjectURL(mediaSource);

  mediaSource.addEventListener('sourceopen', async () => {
    const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8,vorbis"');
    const blob = await binaryStreamToBlob(stream, 'video/webm');

    console.log('blob', blob);

    sourceBuffer.addEventListener('updateend', () => {
      console.log('updateend', mediaSource.readyState);
      mediaSource.endOfStream();
      videoPlayer.play();
    });

    sourceBuffer.appendBuffer(await blob.arrayBuffer());
  });
}

export default downloadFile;
