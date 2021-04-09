import {useCallback, ReactNode} from 'react';
import {useSnackbar} from 'hooks';
import {Value} from 'models';
import {api} from 'utils';

const computeBackground = <T>(color: string | undefined, data: T | undefined): string | undefined => {
  if (undefined !== color) {
    switch (color) {
      case 'primary':
        return undefined;
      default:
        return color;
    }
  }

  return undefined === data ? 'transparent' : undefined;
};

const useSnackedApi = <T>() => {
  const snack = useSnackbar();

  return useCallback(
    async (resources: Value[], template?: (data: T) => ReactNode, backgroundColor?: string) => {
      try {
        const {data} = await api<T>(resources);
        snack(template ? template(data) : data, 2000, computeBackground<T>(backgroundColor, data));
      } catch (error) {
        snack(`😩 ${error.message}`);
      }
    },
    [snack]
  );
};

export {useSnackedApi};
