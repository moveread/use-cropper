import { Button, VStack } from '@chakra-ui/react'
import { useCropper } from 'use-cropper'
import { useCropperAnimation } from 'use-cropper/dist/animation'
import { useEffect } from 'react'

export function App() {
  
  const { cropper, animate } = useCropper('/images/sheet0.jpg')
  const { animation, run } = useCropperAnimation(animate)


  useEffect(() => {run()}, [])

  return (
    <VStack h='100vh' w='100vw' justify='center' align='center'>
      <VStack position='relative'>
        {cropper}
        {animation}
      </VStack>
      <Button onClick={run}>Animate</Button>
    </VStack>
  )
}

export default App