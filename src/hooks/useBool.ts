import {useCallback, useState} from 'react';

const useBool = (
  initial: boolean = false
): [boolean, () => void, () => void, () => void, React.Dispatch<React.SetStateAction<boolean>>] => {
  const [value, setValue] = useState<boolean>(initial);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue(value => !value), []);

  return [value, setTrue, setFalse, toggle, setValue];
};

export {useBool};
