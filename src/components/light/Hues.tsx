import {ReactElement, useCallback, useEffect, useState} from 'react';
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
import {api, emojiFirst, label} from 'utils';

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
    width: 9vh;
    height: 9vh;
    border-radius: 50%;
  }
`;

const Hue = styled(ButtonBase)<{color: string}>`
  background-color: ${({color}) => color};
`;

const Brightness = styled(Slider)`
  width: 130%;
`;

const Lights = styled.div`
  margin: 10px 0;
`;

const getLightIcon = (name: string): ReactElement => {
  switch (name) {
    case 'Boule':
      return <PanoramaFishEye />;
    case 'Strip':
      return <GestureRounded />;
    case 'Pied':
      return <HighlightRounded />;
    case 'Applique':
      return <EmojiObjectsRounded />;
    default:
      return <EmojiObjectsRounded />;
  }
};

const Hues = () => {
  const [palette] = usePalette();
  const snackedApi = useSnackedApi();
  const [lights, setLights] = useState<Light[]>([]);

  const fetchLights = async () => {
    const {data} = await api<Light[]>(['hue', 'light']);
    setLights(data);
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

  if (0 === lights.length) return null;

  return (
    <Container>
      <IconButton color="inherit" onClick={() => handleHueClick(undefined)}>
        <PowerSettingsNewRounded />
      </IconButton>
      <HueGrid>
        {DEFAULT_COLORS.concat(palette).map((color, index) => (
          <Hue key={index} color={color} onClick={() => handleHueClick(color)} />
        ))}
      </HueGrid>
      <Lights>
        {lights
          .filter(({isReachable}) => isReachable)
          .map(({id, name}) => (
            <IconButton
              key={id}
              color="secondary"
              onClick={() =>
                snackedApi<boolean>(
                  ['hue', 'toggle', id],
                  on => emojiFirst(`Toggling ${label(name)} ${on ? 'on' : 'off'}...`),
                  '#000'
                )
              }
            >
              {getLightIcon(name)}
            </IconButton>
          ))}
      </Lights>
      <Brightness
        defaultValue={100}
        valueLabelDisplay="auto"
        onChangeCommitted={(_event, brightness) => api(['hue', 'brightness', Number(brightness)])}
      />
    </Container>
  );
};

export {Hues};
