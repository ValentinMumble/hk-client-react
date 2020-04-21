//TODO reuse better api
const api = async (uri: string, {data = {}, method = 'GET'} = {}) => {
  const response = await fetch(uri, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded', //Fucking CORS
    },
    body: Object.entries(data).length === 0 ? null : JSON.stringify(data),
  });
  const json = await response.json();
  console.log('api', json);

  return json;
};

const fetchImage = (url: string) => {
  return new Promise((resolve, reject) => {
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
      newImg.addEventListener('error', () => {
        reject(new Error(`Failed to load image's URL: ${url}`));
      });
    } else resolve(I.GRAY);
  });
};

const inactivityTime = (on: () => void, off: () => void) => {
  let time: number;
  const resetTimer = () => {
    clearTimeout(time);
    time = setTimeout(off, 10000);
    on();
  };

  window.addEventListener('load', resetTimer, true);
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(
    event => {
      document.addEventListener(event, resetTimer, true);
    }
  );
};

const I = {
  BLACK:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  GRAY:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mMs/w8AAfMBeIBXwkoAAAAASUVORK5CYII=',
};

export {api, fetchImage, inactivityTime, I};
