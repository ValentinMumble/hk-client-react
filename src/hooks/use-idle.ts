import {useEffect} from 'react';

const useIdle = (on: () => void, off: () => void) => {
  useEffect(() => {
    let timer: number;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // off();
        console.log('offf -- idle');
      }, 10000);
      //on();
      console.log('onn- -- idle');
    };

    const handleVisibility = () => (document.hidden ? off() : on());

    // ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    //   document.addEventListener(event, resetTimer, true);
    // });

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [on, off]);
};

export {useIdle};
