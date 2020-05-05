import {useEffect} from 'react';

const useIdle = (on: () => void, off: () => void) => {
  useEffect(() => {
    document.addEventListener('click', on);
    window.addEventListener('focus', on);
    window.addEventListener('blur', off);

    return () => {
      document.removeEventListener('click', on);
      window.removeEventListener('focus', on);
      window.removeEventListener('blur', off);
    };
  }, [on, off]);
};

export {useIdle};
