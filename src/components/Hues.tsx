import React, {useCallback} from 'react';
import styled from 'styled-components';
import {IconButton, ButtonBase, Slider} from '@material-ui/core';
import {PowerSettingsNewRounded, PanoramaFishEye} from '@material-ui/icons';
import {useSnackedApi, usePalette} from 'hooks';
import {api} from 'utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  color: #777;
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
  }
`;

const Hue = styled(ButtonBase)<{color: string}>`
  background-color: ${({color}) => color};
`;

const Brightness = styled(Slider)`
  width: 140%;
`;

const colors = ['#ffffff', '#ffaa71', '#01a7c2', '#57b133', '#b13333', '#ff96ca'];

const Hues = () => {
  const [palette] = usePalette();
  const snackedApi = useSnackedApi();

  const handleHueClick = useCallback(
    (color?: string) => {
      if (color) {
        snackedApi(['hue', 'on', color], () => '🌞 Turning lights on...', color);
      } else {
        snackedApi(['hue', 'off'], () => '🌚 Turning lights off...', '#000');
      }
    },
    [snackedApi]
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
          snackedApi(['hue', 'off', 4], () => '🔮 Turning boule off...', '#000');
        }}
      >
        <PanoramaFishEye />
      </IconButton>
      <Brightness
        defaultValue={100}
        valueLabelDisplay="auto"
        onChangeCommitted={(_e, v) => api(['hue', 'brightness', Number(v)])}
      />
    </Container>
  );
};

export {Hues};
