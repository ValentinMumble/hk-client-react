import qs from 'query-string';

export const api = async (uri, { data = {}, method = 'GET' } = {}) => {
  const response = await fetch(uri, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded' //Fucking CORS
    },
    body: Object.entries(data).length === 0 ? null : qs.stringify(data)
  });
  const json = await response.json();
  console.log('api', json);
  return json;
};

export const fetchImage = url => {
  return new Promise((resolve, reject) => {
    if (url) {
      const newImg = new Image();
      newImg.crossOrigin = 'Anonymous';
      newImg.src = url;
      newImg.addEventListener('load', () => {
        const canvas = document.createElement('canvas');
        canvas.width = newImg.width;
        canvas.height = newImg.height;
        canvas.getContext('2d').drawImage(newImg, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      });
      newImg.addEventListener('error', () => {
        reject(new Error(`Failed to load image's URL: ${url}`));
      });
    } else resolve(I.GRAY);
  });
};

export const I = {
  BLACK:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  GRAY:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mMs/w8AAfMBeIBXwkoAAAAASUVORK5CYII='
};
