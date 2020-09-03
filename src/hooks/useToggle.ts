import {EffectCallback, useCallback, useState, SetStateAction, Dispatch} from 'react';

const useToggle = (
  initial: boolean
): [boolean, EffectCallback, EffectCallback, EffectCallback, Dispatch<SetStateAction<boolean>>] => {
  const [value, setValue] = useState<boolean>(initial);

  const setTrue = useCallback(() => setValue(true), [setValue]);
  const setFalse = useCallback(() => setValue(false), [setValue]);
  const toggle = useCallback(() => setValue(value => !value), [setValue]);

  return [value, toggle, setTrue, setFalse, setValue];
};

export {useToggle};
