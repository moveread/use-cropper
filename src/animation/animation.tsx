import React, { lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Animate, type Hook as CropperHook } from '../cropper'
import { Modal } from 'framer-animations'
import { useAnimation, motion, type MotionProps } from 'framer-motion'
import { managedPromise } from '../util/promise';
import { Props as ModalProps } from 'framer-animations/dist/modal/Modal';
import DragIcon, { Props as IconConfig } from './DragIcon';

type ExplicitIcon = {
  handIcon?: JSX.Element
}
const isExplicit = (config?: ExplicitIcon | IconConfig): config is ExplicitIcon => (config as ExplicitIcon).handIcon !== undefined
export type Config = (ExplicitIcon | IconConfig) & {
  modalProps?: Omit<ModalProps, 'show'>
  iconProps?: Omit<MotionProps, 'initial' | 'animate'>
}
export type Hook = {
  animation: JSX.Element
  run(): void
}
export function useCropperAnimation(animate: CropperHook['animate'], config?: Config): Hook {

  const [modal, setModal] = useState(false)
  const iconControls = useAnimation()
  const loaded = useRef(managedPromise<Animate>())

  useEffect(() => {
    if (animate.loaded)
      loaded.current.resolve(animate)
  }, [animate])

  const run = useCallback(() => setModal(true), [setModal])

  const runAnimation = useCallback(async () => {
    const animate = await loaded.current.promise;
    await animate({ tl: [0, 0], tr: [1, 0], br: [1, 1], bl: [0, 1] }, { duration: 0.1 })
    iconControls.stop()
    await Promise.all([
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
    await animate({ tl: [0, 0], tr: [1, 0] }, { duration: 200 }),
    setModal(false)
  }, [iconControls, setModal])

  useEffect(() => {
    if (modal)
      runAnimation()
  }, [modal, runAnimation])

  const icon = isExplicit(config)
    ? config.handIcon
    : <DragIcon svg={{ width: '4rem', height: '4rem', ...config?.svg }} path={{ fill: 'white', ...config?.path }} />
  const { style, ...iconProps } = config?.iconProps ?? {}

  const animation = (
    <Modal show={modal} {...config?.modalProps}>
      <motion.div animate={iconControls} initial={{ x: 0, y: '20%', scale: 1 }} style={{
        width: '100%', height: '100%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '4rem', ...style
      }} {...iconProps}>
        {icon}
      </motion.div>
    </Modal>
  )

  return { animation, run }
}