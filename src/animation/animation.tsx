import React, { lazy, memo } from 'react';
import { type Hook as CropperHook } from '../cropper'
import { useModal } from 'framer-animations'
import { useAnimation, motion, type MotionProps } from 'framer-motion'
const DragIcon = lazy(() => import('./DragIcon'))

export type Config = {
  handIcon?: JSX.Element
}
export type Hook = {
  Animation: typeof motion.div
  run(): Promise<void>
}
export function useCropperAnimation(animate: CropperHook['animate'], config?: Config): Hook {
  const { Modal, animate: animateModal } = useModal({ opacity: 0.4 })

  const iconControls = useAnimation()

  async function run() {
    iconControls.stop()
    await Promise.all([
      animateModal('show'),
      iconControls.start({ x: '-10%', y: 0, scale: 0.7 }, { duration: 0.2 })
    ]);
    await Promise.all([
      animate({ tl: [0.1, 0.1] }, { duration: 200 }),
      iconControls.start({ x: '5%', y: '15%', scale: 0.7 }, { duration: 0.2 })
    ])
    await iconControls.start({ scale: 1 })
    await iconControls.start({ x: '20%', y: '5%', scale: 0.7 })
    await Promise.all([
      animate({ tr: [0.9, 0.1] }, { duration: 200 }),
      iconControls.start({ x: '5%', y: '20%', scale: 0.7 }, { duration: 0.2 })
    ])
    await iconControls.start({ scale: 1 })
    await Promise.all([
      animateModal('hide'),
      animate({ tl: [0, 0], tr: [1, 0] }, { duration: 200 }),
    ])
  }

  const icon = config?.handIcon ?? <DragIcon svg={{ width: '4rem', height: '4rem' }} path={{ fill: 'white' }} />

  const Animation = memo((props: MotionProps) => (
    <Modal {...props}>
      <motion.div animate={iconControls} initial={{ x: 0, y: '20%', scale: 1 }} style={{
        width: '100%', height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '4rem'
      }}>
        {icon}
      </motion.div>
    </Modal>
  ))

  return { Animation, run }
}