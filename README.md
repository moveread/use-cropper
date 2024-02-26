# Use Cropper

> Simple, mobile-friendly, animatable, customizable perspective cropper

Mobile-friendly dragging            |  Programmatic animating
:-------------------------:|:-------------------------:
![Cropper in action](media/cropper.gif)  |  ![Cropper animation](media/cropper-animation.gif)

## Usage

```jsx
import { useCropper } from 'use-cropper'

const { cropper, coords } = useCropper('/path/to/image.png')
// or, for slightly better performance:
const { cropper, getCoords } = useCropper('/path/to/image.png', {lazyCoords: true})

return (
  <div>
    {cropper}
  </div>
)
```

#### Animating
```jsx
const { cropper, animate } = useCropper('/path/to/image.png')
import { fabric } from 'fabric' // optionally, for predefined easing functions

async function runAnimation() {
  await animate({ tl: [0.1, 0.1], tr: [0.9, 0.1] }, { easing: fabric.util.ease.easeOutExpo })
  await new Promise(r => setTimeout(r, 200))
  await animate({ tl: [0, 0], tr: [1, 0] })
}
```

## Hint/Animation

Optionally, you can install [`framer-animations`](https://www.npmjs.com/package/framer-animations) to add this animation (useful as a simple guide for users)

![User hint animation](media/cropper-hint.gif)

```bash
yarn add framer-animations
```

```jsx
import { useCropper } from 'use-cropper'
import { useCropperAnimation } from 'use-cropper/dist/animation'

const { cropper, animate } = useCropper('/images/sheet0.jpg')
const { Animation, run } = useCropperAnimation(animate)

return (
  ...
  <div>
    {cropper}
    <Animation />
  </div>
  <button onClick={run}>Help</button>
  ...
)
```