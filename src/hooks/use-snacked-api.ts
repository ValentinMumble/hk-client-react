import {useCallback, ReactNode} from 'react';
import {useSnackbar} from 'contexts';
import {api} from 'utils';

const useSnackedApi = <T>() => {
  const snack = useSnackbar();

  return useCallback(
    async (resources: string[], template?: (result: T) => ReactNode, backgroundColor?: string) => {
      const {
        results: [message],
        errors: [error],
      } = await api<T>(resources);

      if (error) {
        snack(`😩 ${error.message}`);
      } else {
        snack(template ? template(message) : message, 2000, backgroundColor);
      }
    },
    [snack]
  );
};

export {useSnackedApi};
