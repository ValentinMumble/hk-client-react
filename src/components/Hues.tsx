import React, {useCallback} from 'react';
import styled from 'styled-components';
import {IconButton, ButtonBase} from '@material-ui/core';
import {PowerSettingsNewRounded, PanoramaFishEye} from '@material-ui/icons';
import {usePalette, useSnackbar} from 'contexts';
import {api} from 'utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
`;

const HueGrid = styled.div`
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

const Hue = styled(ButtonBase)<{color: string}>`
  background-color: ${({color}) => color};
`;

const colors = ['#ffffff', '#ffaa71', '#01a7c2', '#57b133', '#b13333', '#ff96ca'];

const Hues = () => {
  const {palette} = usePalette();
  const snack = useSnackbar();

  const handleHueClick = useCallback(
    (color?: string) => {
      if (color) {
        api(['hue', 'on', color.substring(1)]);
        snack('🌞 Turning lights on...', 1000, color);
      } else {
        api(['hue', 'off']);
        snack('🌚 Turning lights off...', 1000, '#000');
      }
    },
    [snack]
  );

  return (
    <Container>
      <IconButton color="inherit" onClick={() => handleHueClick()}>
        <PowerSettingsNewRounded />
      </IconButton>
      <HueGrid>
        {colors.concat(palette).map((color, i) => (
          <Hue key={i} color={color} onClick={() => handleHueClick(color)} />
        ))}
      </HueGrid>
      <IconButton
        color="inherit"
        onClick={() => {
          api(['hue', 'off', 4]);
          snack('🔮 Turning boule off...', 1000, '#000');
        }}
      >
        <PanoramaFishEye />
      </IconButton>
    </Container>
  );
};

export {Hues};
