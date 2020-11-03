import {useCallback, ReactNode} from 'react';
import {useSnackbar} from 'hooks';
import {Value} from 'models';
import {api} from 'utils';

const useSnackedApi = <T>() => {
  const snack = useSnackbar();

  return useCallback(
    async (resources: Value[], template?: (result: T) => ReactNode, backgroundColor?: string) => {
      try {
        const {status, result} = await api<T>(resources);
        snack(
          template ? template(result) : result,
          2000,
          backgroundColor ?? (204 === status ? 'transparent' : undefined)
        );
      } catch (error) {
        snack(`😩 ${error.message}`);
      }
    },
    [snack]
  );
};

export {useSnackedApi};
