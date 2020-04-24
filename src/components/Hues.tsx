import React from 'react';
import styled from 'styled-components';
import {IconButton, ButtonBase} from '@material-ui/core';
import {PowerSettingsNewRounded} from '@material-ui/icons';
import {useTheme} from 'Theme';
import {useSnackbar} from 'Snackbar';
import {api} from 'utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
`;

const ColorsDiv = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-auto-flow: column;
  grid-gap: 2vh;

  button {
    width: 10vh;
    height: 10vh;
    border-radius: 50%;
    transition: all 0.6s ease;
  }
`;

const ColorButton = styled(ButtonBase)<{color: string}>`
  background-color: ${({color}) => color};
`;

const colors = ['#ffffff', '#ffaa71', '#01a7c2', '#57b133', '#b13333', '#ff96ca'];

const Hues = () => {
  const {palette} = useTheme();
  const snack = useSnackbar();

  const handleHueClick = (color?: string) => {
    if (color) {
      api(['hue', 'on', color.substring(1)]);
      snack('Turning lights on...', 1000, color);
    } else {
      api(['hue', 'off']);
      snack('Turning lights off...', 1000, '#000');
    }
  };

  return (
    <Container>
      <IconButton color="inherit" onClick={() => handleHueClick()}>
        <PowerSettingsNewRounded />
      </IconButton>
      <ColorsDiv>
        {colors.concat(palette).map((color, i) => (
          <ColorButton key={i} color={color} onClick={() => handleHueClick(color)} />
        ))}
      </ColorsDiv>
    </Container>
  );
};

export {Hues};
