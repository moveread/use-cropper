import { useCropper } from "use-cropper"
import { useCropperAnimation } from 'use-cropper/dist/animation'

function App() {

  const { ref, animate } = useCropper('/use-cropper/images/image.jpg')
  const { animation, run } = useCropperAnimation(animate, {
    modalProps: {style: {background: '#0004'}}
  })

  return (
    <div style={{height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'gray'}}>
      <div style={{ height: '100%', width: '60vh', position: 'relative'}}>
        <canvas ref={ref} />
        {animation}
      </div>
      <button style={{margin: '1rem', padding: '1rem', fontSize: '1.5rem'}} onClick={() => run()}>Animate</button>
    </div>
  )
}

export default App
