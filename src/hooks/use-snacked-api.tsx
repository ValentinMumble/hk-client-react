import React, {useCallback} from 'react';
import {Warning} from '@material-ui/icons';
import {useSnackbar} from 'Snackbar';
import {Span} from 'components';
import {api} from 'utils';

const useSnackedApi = () => {
  const snack = useSnackbar();

  return useCallback(
    async (resources: string[], template?: string) => {
      const {
        results: [message],
        errors: [error],
      } = await api<string>(resources);

      snack(
        error ? (
          <Span>
            <Warning fontSize="small" /> {error.message}
          </Span>
        ) : (
          <>{template ? template.replace('%s', message) : message}</>
        )
      );
    },
    [snack]
  );
};

export {useSnackedApi};
