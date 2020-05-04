import {ServerError} from 'models';

type Value = string | number | boolean;

type Params = {
  [key: string]: Value;
};

type APIResponse<T> = {
  results: T[];
  errors: ServerError[];
  status: number;
  uri: string;
};

const api = async <T>(resource: Value[], params: Params = {}, options?: RequestInit): Promise<APIResponse<T>> => {
  const url = new URL(
    resource.map(sub => encodeURIComponent(sub)).join('/'),
    'hk' === resource[0] ? process.env.REACT_APP_HK_API : process.env.REACT_APP_SERVER_URL
  );
  Object.keys(params).forEach((key: string) => {
    url.searchParams.append(key, params[key].toString());
  });
  const response = await fetch(url.toString(), options);

  return response.json();
};

const fetchImage = (url: string): Promise<string> =>
  new Promise((resolve, reject) => {
    if (url) {
      const newImg = new Image();
      newImg.crossOrigin = 'Anonymous';
      newImg.src = url;
      newImg.addEventListener('load', () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (null !== context) {
          canvas.width = newImg.width;
          canvas.height = newImg.height;
          context.drawImage(newImg, 0, 0);
        }
        resolve(canvas.toDataURL('image/png'));
      });
      newImg.addEventListener('error', () => reject(new Error(`Failed to load image's URL: ${url}`)));
    } else resolve(I.GRAY);
  });

const I = {
  BLACK:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  GRAY:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mMs/w8AAfMBeIBXwkoAAAAASUVORK5CYII=',
};

export {api, fetchImage, I};
