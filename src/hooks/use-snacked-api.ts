import {useCallback, ReactNode} from 'react';
import {useSnackbar} from 'contexts';
import {api} from 'utils';

const useSnackedApi = <T>() => {
  const snack = useSnackbar();

  return useCallback(
    async (resources: string[], template?: (result: T) => ReactNode, backgroundColor?: string) => {
      const {
        status,
        results: [message],
        errors: [error],
      } = await api<T>(resources);

      if (error) {
        snack(`😩 ${error.message}`);
      } else {
        snack(template ? template(message) : message, 2000, 204 === status ? 'transparent' : backgroundColor);
      }
    },
    [snack]
  );
};

export {useSnackedApi};
