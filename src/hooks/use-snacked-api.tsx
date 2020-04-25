import {useCallback, ReactNode} from 'react';
import {useSnackbar} from 'Snackbar';
import {api} from 'utils';

const useSnackedApi = () => {
  const snack = useSnackbar();

  return useCallback(
    async (resources: string[], template?: (result: string) => ReactNode, backgroundColor?: string) => {
      const {
        results: [message],
        errors: [error],
      } = await api<string>(resources);

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
