import React, { Component } from 'react';
import './Hues.css';
import { IconButton, ButtonBase } from '@material-ui/core';
import { PowerSettingsNewRounded } from '@material-ui/icons';

class Hues extends Component {
  // TODO use hooks
  constructor(props) {
    super(props);
    this.colors = ['#ffffff', '#ffaa71', '#01a7c2', '#57b133', '#b13333', '#ff96ca'];
  }
  render() {
    return (
      <div className='Hues'>
        <IconButton color='inherit' onClick={() => this.props.onHueClick()}>
          <PowerSettingsNewRounded />
        </IconButton>
        <div>
          {this.colors.concat(this.props.palette).map((color, i) => (
            <ButtonBase key={i} style={{ backgroundColor: color }} onClick={() => this.props.onHueClick(color)} />
          ))}
        </div>
      </div>
    );
  }
}
export default Hues;
