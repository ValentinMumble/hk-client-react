import {useEffect, useCallback} from 'react';

const IDLE_DELAY = 20000;
const events = ['scroll', 'click'];
let timer: number;

const useIdle = (on: () => void, off: () => void) => {
  const resetTimer = useCallback(() => {
    clearTimeout(timer);
    timer = setTimeout(() => off(), IDLE_DELAY);
    on();
  }, [on, off]);

  useEffect(() => {
    const handleVisibility = () => (document.hidden ? off() : on());

    document.addEventListener('visibilitychange', handleVisibility);
    events.forEach(event => document.addEventListener(event, resetTimer));

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [resetTimer, on, off]);
};

export {useIdle};
