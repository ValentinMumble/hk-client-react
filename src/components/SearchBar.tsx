import React, {forwardRef} from 'react';
import styled from 'styled-components';
import {Avatar, TextField} from '@material-ui/core';
import {AutocompleteRenderInputParams} from '@material-ui/lab';
import {Artist} from 'models';

const SearchField = styled(TextField)`
  width: 400px;
  max-width: 80vw;
`;

type SearchBarProps = AutocompleteRenderInputParams & {artist?: Artist};

const SearchBar = forwardRef<HTMLDivElement, SearchBarProps>(({artist, InputProps, ...rest}: SearchBarProps, ref) => (
  <SearchField
    {...rest}
    ref={ref}
    variant="outlined"
    autoFocus={true}
    InputProps={
      undefined === artist
        ? InputProps
        : {
            ...InputProps,
            endAdornment: <Avatar src={artist.images[0].url} alt={artist.name} />,
          }
    }
  />
));

export {SearchBar};
