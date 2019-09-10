// Compound Components

import React from 'react'
import { Switch } from '../switch'

function Toggle({ children }) {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)

  return React.Children.map(children, child =>
    React.cloneElement(child, { on, toggle })
  )
}

// 🐨 Flush out each of these components

// Accepts `on` and `children` props and returns `children` if `on` is true
const ToggleOn = ({on, children}) => on ? children : null

// Accepts `on` and `children` props and returns `children` if `on` is false
const ToggleOff = ({ on, children }) => on ? null : children

// Accepts `on` and `toggle` props and returns the <Switch /> with those props.
const ToggleButton = ({ on, toggle, ...props }) =>
  <Switch on={on} onClick={toggle} {...props} />

/*
🦉 Elaboration & Feedback
After the instruction, copy the URL below into your browser and fill out the form:
http://ws.kcd.im/?ws=Advanced%20React%20Patterns&e=Compound%20Components&em=
*/

////////////////////////////////////////////////////////////////////
//                                                                //
//                 Don't make changes below here.                 //
// But do look at it to see how your code is intended to be used. //
//                                                                //
////////////////////////////////////////////////////////////////////

function Usage() {
  return (
    <div>
      <Toggle>
        <ToggleOn>The button is on</ToggleOn>
        <ToggleOff>The button is off</ToggleOff>
        <ToggleButton />
      </Toggle>
    </div>
  )
}
Usage.title = 'Compound Components'

export default Usage
