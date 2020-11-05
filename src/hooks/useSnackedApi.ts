import {useCallback, ReactNode} from 'react';
import {useSnackbar} from 'hooks';
import {Value} from 'models';
import {api} from 'utils';

const useSnackedApi = <T>() => {
  const snack = useSnackbar();

  return useCallback(
    async (resources: Value[], template?: (data: T) => ReactNode, backgroundColor?: string) => {
      try {
        const {data} = await api<T>(resources);
        snack(
          template ? template(data) : data,
          2000,
          backgroundColor ?? (undefined === data ? 'transparent' : undefined)
        );
      } catch (error) {
        snack(`😩 ${error.message}`);
      }
    },
    [snack]
  );
};

export {useSnackedApi};
