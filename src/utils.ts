import {Value} from 'models';

type Params = {
  [key: string]: Value;
};

type APIResponse<T> = {
  data: T;
  status: number;
  url: string;
};

const api = async <T>(resource: Value[], params: Params = {}, options?: RequestInit): Promise<APIResponse<T>> => {
  const url = new URL(
    resource.map(encodeURIComponent).join('/'),
    'hk' === resource[0] ? process.env.REACT_APP_HK_API : process.env.REACT_APP_SERVER_URL
  );
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key].toString());
  });
  const response = await fetch(url.toString(), {headers: {'Content-Type': 'application/json'}, ...options});
  const data = 204 === response.status ? undefined : await response.json();

  if (500 === response.status) {
    throw new Error(data?.message ?? data ?? response.statusText);
  }

  return {
    url: response.url,
    status: response.status,
    data,
  };
};

const fetchImage = (url: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src = url;
    image.addEventListener('load', () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (null !== context) {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
      }
      resolve(canvas.toDataURL('image/png'));
    });
    image.addEventListener('error', () => reject(Error(`Failed to load image's URL: ${url}`)));
  });

const emojiFirst = (string: string): string => {
  const array = Array.from(string);

  array.forEach((char, index) => {
    if (char.match(/\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/)) {
      array.splice(index, 1);
      array.unshift(char, ' ');
    }
  });

  return array.join('').replace(/ +(?= )/g, '');
};

const formatDuration = (duration: number) => new Date(duration).toISOString().substr(14, 5).replace(/^0/, '');

const LABELS: {[key: string]: string} = {
  // Playlists
  OK: '👌 OK',
  'Discover Weekly': '✨ Discover',
  '<3': '❤️ Likes',
  'Radar des sorties': '📡 Release Radar',
  // Devices
  Pi: '🔈 π',
  MacMumble: '💻 MacMumble',
  'ONEPLUS A6013': '📱 OnePlus',
  'Akeneo Mumble 16': '👾 Akemumble',
  // Lights
  'Hue lightstrip': '🌈 Strip',
  'Hue Boule': '🔮 Boule',
  'Lux Pied': '🛋 Pied',
  // Logs
  'No active device\n': 'No active device... 🏜',
  'Transfering playback to a13438854aceabf5a965c5bd61f9c40684610db5\n': 'Transfering ➡️ π',
  'Refreshing token\n': 'Refreshing token ♻️',
  'The access token expired\n': 'Token expired 🚪',
};

const label = (key: string): string => LABELS[key] ?? key;

const short = (sentence: string) =>
  sentence
    .split(' ')
    .map(word => word.substring(0, 2))
    .join(' ');

const I = {
  BLACK:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  GRAY: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mMs/w8AAfMBeIBXwkoAAAAASUVORK5CYII=',
};

export {api, fetchImage, I, emojiFirst, label, formatDuration, short};
