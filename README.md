# Use Cropper

> Simple, mobile-friendly, animatable, customizable perspective cropper

Mobile-friendly dragging            |  Programmatic animating
:-------------------------:|:-------------------------:
![Cropper in action](media/cropper.gif)  |  ![Cropper animation](media/cropper-animation.gif)

- [Demo](https://moveread.github.io/use-cropper/)

## Usage

```jsx
import { useCropper } from 'use-cropper'

const { ref, coords } = useCropper('/path/to/image.png')
// or, for slightly better performance:
const { ref, getCoords } = useCropper('/path/to/image.png', {lazyCoords: true})

return (
  <div>
    <canvas style={{height: '100%', width: '100%' }} ref={ref} />
  </div>
)
```

#### Animating
```jsx
import { fabric } from 'fabric' // optionally, for predefined easing functions

const { ref, animate } = useCropper('/path/to/image.png')

async function runAnimation() {
  if (!animate.loaded)
    return
  await animate({ tl: [0.1, 0.1], tr: [0.9, 0.1] }, { easing: fabric.util.ease.easeOutExpo })
  await new Promise(r => setTimeout(r, 200))
  await animate({ tl: [0, 0], tr: [1, 0] })
}
```

## Hint/Animation

Optionally, you can install [`framer-animations`](https://www.npmjs.com/package/framer-animations) to add this animation (useful as a simple guide for users)

![User hint animation](media/cropper-hint.gif)

```bash
npm i framer-animations
```

```bash
yarn add framer-animations
```

```jsx
import { useCropper } from 'use-cropper'
import { useCropperAnimation } from 'use-cropper/dist/animation'

const { ref, animate } = useCropper('/image.jpg')
const { animation, run } = useCropperAnimation(animate)

return (
  ...
  <div style={{position: 'relative'}}>
    <canvas style={{height: '100%', width: '100%' }} ref={ref} />
    {animation}
  </div>
  <button onClick={run}>Help</button>
  ...
)
```