import { Button, VStack } from '@chakra-ui/react'
import { MdPanToolAlt } from 'react-icons/md'
import { useCropper } from 'use-cropper'
import { useCropperAnimation } from 'use-cropper/dist/animation'

export function App() {
  
  const { cropper, animate } = useCropper('/images/sheet0.jpg')
  const { Animation, run } = useCropperAnimation(animate)

  return (
    <VStack h='100vh' w='100vw' justify='center' align='center'>
      <VStack position='relative'>
        {cropper}
        <Animation />
      </VStack>
      <Button onClick={run}>Animate</Button>
    </VStack>
  )
}

export default App