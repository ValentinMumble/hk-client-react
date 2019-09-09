import React, { Component } from 'react'
import './Hues.css'

class Hues extends Component {
  constructor(props) {
    super(props)
    this.state = {
      colors: ['transparent', props.theme.palette.primary.main, '#ffffff', '#ffaa71', '#01a7c2', '#ff96ca']
    }
  }
  render() {
    return (
      <div className="Hues">
        {this.state.colors.map((color, i) => <div key={i} style={{ backgroundColor: color }} onClick={() => this.props.onHueClick(color)}></div>)}
      </div>
    )
  }
}
export default Hues