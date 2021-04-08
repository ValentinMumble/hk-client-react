import {EffectCallback, useCallback, useState, SetStateAction, Dispatch} from 'react';

const useToggle = (
  initial: boolean = false
): [boolean, EffectCallback, EffectCallback, EffectCallback, Dispatch<SetStateAction<boolean>>] => {
  const [value, setValue] = useState<boolean>(initial);

  const toggle = useCallback(() => setValue(value => !value), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, toggle, setTrue, setFalse, setValue];
};

export {useToggle};
