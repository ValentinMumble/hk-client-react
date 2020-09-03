import {useCallback, useEffect} from 'react';

const useShortcut = (key: string, callback: Function, preventDefault: boolean = false) => {
  const memoizedCallback = useCallback(
    (event: KeyboardEvent) => {
      if (key === event.code) {
        if (preventDefault) event.preventDefault();
        callback(event);
      }
    },
    [key, callback, preventDefault]
  );

  useEffect(() => {
    document.addEventListener('keydown', memoizedCallback);

    return () => document.removeEventListener('keydown', memoizedCallback);
  }, [memoizedCallback]);
};

export {useShortcut};
