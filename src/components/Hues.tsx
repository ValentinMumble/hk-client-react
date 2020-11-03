import React, {ReactElement, useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import {IconButton, ButtonBase, Slider} from '@material-ui/core';
import {
  PowerSettingsNewRounded,
  PanoramaFishEye,
  EmojiObjectsRounded,
  HighlightRounded,
  GestureRounded,
} from '@material-ui/icons';
import {Light} from 'models';
import {useSnackedApi, usePalette} from 'hooks';
import {api} from 'utils';

const DEFAULT_COLORS = ['#ffffff', '#ffaa71', '#01a7c2', '#57b133', '#b13333', '#ff96ca'];

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

const Lights = styled.div`
  margin: 10px 0;
`;

const getLightIcon = (id: number): ReactElement => {
  switch (id) {
    case 1:
      return <EmojiObjectsRounded />;
    case 3:
      return <GestureRounded />;
    case 5:
      return <HighlightRounded />;
    case 4:
    default:
      return <PanoramaFishEye />;
  }
};

const Hues = () => {
  const [palette] = usePalette();
  const snackedApi = useSnackedApi<boolean>();
  const [lights, setLights] = useState<Light[]>([]);

  const fetchLights = async () => {
    const {result} = await api<Light[]>(['hue', 'lights']);
    setLights(result);
  };

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

  useEffect(() => {
    fetchLights();
  }, []);

  return (
    <Container>
      <IconButton color="inherit" onClick={() => handleHueClick()}>
        <PowerSettingsNewRounded />
      </IconButton>
      <HueGrid>
        {DEFAULT_COLORS.concat(palette).map((color, i) => (
          <Hue key={i} color={color} onClick={() => handleHueClick(color)} />
        ))}
      </HueGrid>
      <Lights>
        {lights
          .filter(light => light.isReachable)
          .map(({id, name}) => (
            <IconButton
              key={id}
              color="secondary"
              onClick={() => {
                snackedApi(['hue', 'toggle', id], on => `🔮 Toggling ${name} ${on ? 'on' : 'off'}...`, '#000');
              }}
            >
              {React.cloneElement(getLightIcon(id))}
            </IconButton>
          ))}
      </Lights>
      <Brightness
        defaultValue={100}
        valueLabelDisplay="auto"
        onChangeCommitted={(_, v) => api(['hue', 'brightness', Number(v)])}
      />
    </Container>
  );
};

export {Hues};
