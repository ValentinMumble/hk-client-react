import {ServerError, Value} from 'models';

type Params = {
  [key: string]: Value;
};

type APIResponse<T> = {
  result: T;
  status: number;
  url: string;
};

const api = async <T>(resource: Value[], params: Params = {}, options?: RequestInit): Promise<APIResponse<T>> => {
  const url = new URL(
    resource.map(sub => encodeURIComponent(sub)).join('/'),
    'hk' === resource[0] ? process.env.REACT_APP_HK_API : process.env.REACT_APP_SERVER_URL
  );
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key].toString());
  });
  const response = await fetch(url.toString(), {headers: {'Content-Type': 'application/json'}, ...options});

  if (500 === response.status) {
    throw new Error(response.statusText);
  }

  return {
    url: response.url,
    status: response.status,
    result: 204 === response.status ? undefined : (await response.json()).result,
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

const I = {
  BLACK:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  GRAY:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mMs/w8AAfMBeIBXwkoAAAAASUVORK5CYII=',
};

export {api, fetchImage, I, emojiFirst};
