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

export const fetchImage = (url, callback) => {
  const downloadedImg = new Image();
  downloadedImg.crossOrigin = 'Anonymous';
  downloadedImg.src = url;
  downloadedImg.addEventListener('load', () => {
    const canvas = document.createElement('canvas');
    canvas.width = downloadedImg.width;
    canvas.height = downloadedImg.height;
    canvas.getContext('2d').drawImage(downloadedImg, 0, 0);
    callback(canvas.toDataURL('image/png'), downloadedImg);
  });
};

export const I = {
  BLACK:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  GRAY:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mMs/w8AAfMBeIBXwkoAAAAASUVORK5CYII='
};
