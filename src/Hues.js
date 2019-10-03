import React from 'react';
import { IconButton, ButtonBase } from '@material-ui/core';
import { PowerSettingsNewRounded } from '@material-ui/icons';
import styled from 'styled-components';

const HuesDiv = styled.div`
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

const ColorButton = styled(ButtonBase).attrs(props => ({
  style: {
    backgroundColor: props.backgroundcolor
  }
}))``;

const colors = ['#ffffff', '#ffaa71', '#01a7c2', '#57b133', '#b13333', '#ff96ca'];

export const Hues = ({ palette, onHueClick }) => {
  return (
    <HuesDiv>
      <IconButton color='inherit' onClick={() => onHueClick()}>
        <PowerSettingsNewRounded />
      </IconButton>
      <ColorsDiv>
        {colors.concat(palette).map((color, i) => (
          <ColorButton key={i} backgroundcolor={color} onClick={() => onHueClick(color)} />
        ))}
      </ColorsDiv>
    </HuesDiv>
  );
};
