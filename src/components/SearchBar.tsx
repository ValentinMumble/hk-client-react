import React, {forwardRef} from 'react';
import styled from 'styled-components';
import {Avatar, TextField} from '@material-ui/core';
import {AutocompleteRenderInputParams} from '@material-ui/lab';
import {Artist} from 'models';

const SearchField = styled(TextField)`
  width: 400px;
  max-width: 80vw;

  input {
    height: 21px;
  }

  label {
    transform: translate(7px, 5px) scale(0.7);
  }
`;

type SearchBarProps = AutocompleteRenderInputParams & {artist?: Artist};

const SearchBar = forwardRef<HTMLDivElement, SearchBarProps>(({artist, InputProps, ...rest}: SearchBarProps, ref) => (
  <SearchField
    {...rest}
    label={artist?.name}
    ref={ref}
    variant="outlined"
    autoFocus={true}
    //Check this shit
    InputLabelProps={{
      shrink: false,
    }}
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
