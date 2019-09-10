import React, { Component } from 'react'
import './Hues.css'
import { IconButton } from '@material-ui/core'
import { PowerSettingsNewRounded } from '@material-ui/icons'

class Hues extends Component {
  constructor(props) {
    super(props)
    this.state = {
      colors: [props.theme.palette.primary.main, '#ffffff', '#ffaa71', '#01a7c2', '#ff96ca']
    }
  }
  componentDidUpdate(prevProps) {
    if (this.props.theme !== prevProps.theme) {
      const colors = Array.from(this.state.colors)
      colors[0] = this.props.theme.palette.primary.main
      this.setState({ colors })
    }
  }
  render() {
    return (
      <div className="Hues">
        <IconButton color="inherit" onClick={() => this.props.onHueClick()}>
          <PowerSettingsNewRounded />
        </IconButton>
        {this.state.colors.map((color, i) => <div key={i} style={{ backgroundColor: color }} onClick={() => this.props.onHueClick(color)}></div>)}
      </div>
    )
  }
}
export default Hues