import {useEffect} from 'react';

const useIdle = (on: () => void, off: () => void) => {
  useEffect(() => {
    window.addEventListener('focus', on);
    window.addEventListener('blur', off);

    return () => {
      window.removeEventListener('focus', on);
      window.removeEventListener('blur', off);
    };
  }, [on, off]);
};

export {useIdle};
