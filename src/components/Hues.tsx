import React from 'react';
import styled from 'styled-components';
import {IconButton, ButtonBase} from '@material-ui/core';
import {PowerSettingsNewRounded} from '@material-ui/icons';

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

const ColorButton = styled(ButtonBase).attrs(({color}: {color: string}) => ({
  style: {backgroundColor: color},
}))``;

const colors = ['#ffffff', '#ffaa71', '#01a7c2', '#57b133', '#b13333', '#ff96ca'];

type HuesProps = {
  palette: string[];
  onHueClick: (color?: string) => void;
};

const Hues = ({palette, onHueClick}: HuesProps) => {
  return (
    <Container>
      <IconButton color="inherit" onClick={() => onHueClick()}>
        <PowerSettingsNewRounded />
      </IconButton>
      <ColorsDiv>
        {colors.concat(palette).map((color, i) => (
          <ColorButton key={i} color={color} onClick={() => onHueClick(color)} />
        ))}
      </ColorsDiv>
    </Container>
  );
};

export {Hues};
