import { useCropper } from "use-cropper"
import { useCropperAnimation } from 'use-cropper/dist/animation'

function App() {

  const { ref, animate } = useCropper('/use-cropper/images/fcde-mobile-full.jpg', {
    pads: {l: 0.1, r: 0.1, t: 0.1, b: 0.05 }
  })
  const { animation, run } = useCropperAnimation(animate, {
    modalProps: {style: {background: '#0004'}}
  })

  return (
    <div style={{height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'gray', overflow: 'hidden'}}>
      <div style={{ height: '80%', width: '60vh', position: 'relative'}}>
        <canvas style={{border: '1px solid red', height: '100px'}} ref={ref} />
        {animation}
      </div>
      <button style={{margin: '1rem', padding: '1rem', fontSize: '1.5rem'}} onClick={() => run()}>Animate</button>
    </div>
  )
}

export default App
