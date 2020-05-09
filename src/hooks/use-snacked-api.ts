import {useCallback, ReactNode} from 'react';
import {useSnackbar} from 'contexts';
import {Value} from 'models';
import {api} from 'utils';

const useSnackedApi = <T>() => {
  const snack = useSnackbar();

  return useCallback(
    async (resources: Value[], template?: (result: T) => ReactNode, backgroundColor?: string) => {
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
