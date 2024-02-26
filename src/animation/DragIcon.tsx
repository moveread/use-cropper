import React, { SVGProps } from "react"

type Props = {
  svg: SVGProps<SVGSVGElement>
  path: SVGProps<SVGPathElement>
}
export const DragIcon = ({ svg, path }: Props) => (
  <svg {...svg} xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
    <path {...path} d="M398-120q-27 0-51.5-11.5T305-164L46-483l26-25q19-19 45-22t47 12l116 81v-403q0-17 11.5-28.5T320-880q17 0 28.5 11.5T360-840v557l-111-78 118 146q6 7 14 11t17 4h282q33 0 56.5-23.5T760-280v-280q0-17 11.5-28.5T800-600q17 0 28.5 11.5T840-560v280q0 66-47 113t-113 47H398Zm122-240Zm-80-80v-240q0-17 11.5-28.5T480-720q17 0 28.5 11.5T520-680v240h-80Zm160 0v-200q0-17 11.5-28.5T640-680q17 0 28.5 11.5T680-640v200h-80Z" />
  </svg>
)

export default DragIcon