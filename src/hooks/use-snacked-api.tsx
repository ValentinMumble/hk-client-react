import React, {useCallback} from 'react';
import {Warning} from '@material-ui/icons';
import {useSnackbar} from 'Snackbar';
import {Span} from 'components';
import {api} from 'utils';

const useSnackedApi = () => {
  const snack = useSnackbar();

  return useCallback(
    async (resources: string[], template?: string, backgroundColor?: string) => {
      const {
        results: [message],
        errors: [error],
      } = await api<string>(resources);

      if (error) {
        snack(
          <Span>
            <Warning fontSize="small" />
            {error.message}
          </Span>
        );
      } else {
        snack(template ? template.replace('%s', message) : message, 2000, backgroundColor);
      }
    },
    [snack]
  );
};

export {useSnackedApi};
