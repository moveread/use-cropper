import { useCallback, useEffect, useRef, useState } from "react"
import { fabric } from 'fabric'
import { useFabric, Config as CanvasOptions } from "use-fabric"
import { clamped, coords as coordsOf, height, rescale, width } from "./util/coords"
import { argminBy } from "./util/arrays"
import { Vec2, add, dist, sub } from "./util/vectors"
import { managedPromise } from "./util/promise"

export type CornerOptions = Omit<fabric.ICircleOptions, 'left' | 'top' | 'originX' | 'originY' | 'hasControls'> & {
  radius: number, selectedRadius: number
}
const corner = (v: Vec2, params?: CornerOptions) => new fabric.Circle({
  left: v[0], top: v[1], originX: 'center', originY: 'center',
  hasControls: false, selectable: false, ...params
})

export type ContourOptions = Omit<fabric.IPolylineOptions, 'selectable'>

export type Pads = { l: number, r: number, t: number, b: number }

export type Four<T> = [T, T, T, T]
export type Corners = {
  tl: Vec2, tr: Vec2, br: Vec2, bl: Vec2
}
/** `[tl, tr, br, bl]` */
export const asArray = ({ tl, tr, br, bl }: Corners): Four<Vec2> => [tl, tr, br, bl]

export type Config = {
  pads?: Pads
  topBias?: number
  leftBias?: number
  startCoords?: Corners
  canvasOptions?: CanvasOptions
  cornerOptions?: CornerOptions
  contourOptions?: ContourOptions
  lazyCoords?: boolean
}
export type Animate = (to: Partial<Corners>, config?: AnimationConfig) => Promise<void>
export type Hook = {
  cropper: JSX.Element
  coords: Corners
  getCoords(): Corners
  animate: { loaded: false } | ({
    loaded: true
  } & Animate)
}
export type AnimationConfig = Omit<fabric.IAnimationOptions, 'onChange' | 'onComplete'>

export const defaultCfg: Required<Config> = {
  lazyCoords: false, topBias: 0.2, leftBias: 0.2,
  startCoords: { tl: [0, 0], tr: [1, 0], br: [1, 1], bl: [0, 1] },
  pads: { l: 0.1, r: 0.1, t: 0.1, b: 0.3 },
  canvasOptions: { selection: false, hoverCursor: 'pointer', backgroundColor: 'gray' },
  cornerOptions: { radius: 10, selectedRadius: 30, stroke: 'white', fill: undefined, strokeWidth: 2 },
  contourOptions: { stroke: 'white', strokeWidth: 2, fill: undefined }
}

/**
 * Simple, mobile-friendly, customizable perspective cropper
 * 
 * #### Config
 * - `src`: image to load
 * - `startCoords`: starting corner coords (relative to the image size)
 * - `pads`: relative (to the image width or height) paddings to add around the image
 * - `cornerOptions`: options passed to `new fabric.Circle` for each of the four corners
 *    - `selectRadius`: radius of the corner whilst being dragged
 * - `contourOptions`: options passed to `new fabric.Polygon` for the polygon formed by the corners
 * - `lazyCoords`: whether to skip computing and storing coordinates at every render
 *    - Still coords can be computed on-demand via `getCoords`
 *    - If set to false, `coords` will be always equal to `startCoords`
 * - `topBias`/`leftBias`: since on mobile it's more difficult to drag near the top/left, we default to biasing corners at the top/left being selected
 *    - To decide which corner to drag, we consider:
 *        - Cursor position `(x, y)`
 *        - Image dimensions `w, h`
 *        - `leftBias, topBias`
 *        - Corner positions
 *    - **The chosen corner is the closest to `(x - w*leftBias, y - h*topBias)`**
 *    - Consider using a negative `leftBias` for left-handed mode
 */
export function useCropper(src: string, config?: Config): Hook {

  const { pads, contourOptions, cornerOptions, lazyCoords, topBias, leftBias, startCoords, canvasOptions } = { ...defaultCfg, ...config }
  const { l, r, t, b } = pads
  const startCorners = asArray(startCoords ?? defaultCfg.startCoords)
  const [[tl, tr, br, bl], setCoords] = useState(startCorners)
  const coords: Corners = { tl, tr, br, bl }

  const { Canvas, canvas } = useFabric(canvasOptions)
  const imgRef = useRef<fabric.Image | null>(null)
  const cornersRef = useRef<Four<fabric.Object> | null>(null);
  const contourRef = useRef<fabric.Polygon | null>(null)
  const lastPtr = useRef<Vec2 | null>(null)
  const movingCorner = useRef<number | null>(null)

  function movePoly(to: Vec2, idx: number, poly: fabric.Polygon) {
    const pts = [...poly.points!]
    pts[idx] = new fabric.Point(...to)
    poly.set('points', pts)
    poly.setCoords()
  }

  const computeCoords = useCallback((): Four<Vec2> => {
    const img = imgRef.current;
    return (img && cornersRef.current)
      ? cornersRef.current.map(p => {
        const x = (p.get("left")! - img.get("left")!) / width(img);
        const y = (p.get("top")! - img.get("top")!) / height(img);
        return [x, y] as Vec2;
      }) as Four<Vec2>
      : startCorners
  }, [startCorners])

  const getCoords = useCallback((): Corners => {
    const [tl, tr, br, bl] = computeCoords()
    return { tl, tr, br, bl }
  }, [computeCoords])

  const [loaded, setLoaded] = useState(false)

  const initSheet = useCallback((img: fabric.Image, canvas: fabric.Canvas, w: number) => {
    img.scaleToWidth((1 - l - r) * w);
    img.left = l * w;
    const imgH = height(img)
    const imgW = width(img)
    img.top = t * imgH;
    canvas.setHeight(imgH * (1 + t + b));
    canvas.add(img);
    img.sendToBack();
    imgRef.current = img;

    const rescaledPts = startCorners.map(c => rescale(c, img))
    const fabricPts = rescaledPts.map(([x, y]) => ({ x, y }))
    const polyline = new fabric.Polygon(fabricPts, { selectable: false, objectCaching: false, ...contourOptions })
    canvas.add(polyline)
    polyline.bringToFront()
    contourRef.current = polyline

    const corners: Four<fabric.Object> = rescaledPts.map((p) => {
      const c = corner(p, cornerOptions)
      canvas.add(c)
      c.bringToFront()
      return c
    }) as any
    cornersRef.current = corners

    canvas.on('mouse:move', e => {
      if (movingCorner.current !== null && lastPtr.current) {
        const c = corners[movingCorner.current]
        const { x, y } = e.pointer!
        const [dx, dy] = sub([x, y], lastPtr.current)
        const [left, top] = clamped([c.left! + dx, c.top! + dy], img)
        c.set({ left, top })
        c.setCoords()
        movePoly([left, top], movingCorner.current, polyline)

        canvas.renderAll()
        lastPtr.current = [x, y]
        
        if (!lazyCoords)
          setCoords(computeCoords())
      }
    })
    canvas.on('mouse:down', e => {
      const { x, y } = e.pointer!
      const idx = argminBy(corners, c => {
        /** Bias towards selecting coords on top (as it's harder to access them in mobile) */
        const loweredCoords = add(coordsOf(c), [leftBias * imgW, topBias * imgH])
        return dist(loweredCoords, [x, y])
      })
      movingCorner.current = idx
      lastPtr.current = [x, y]
      corners[idx].animate('radius', cornerOptions.selectedRadius, {
        onChange: () => canvas.renderAll(),
        duration: 100
      })
    })
    canvas.on('mouse:up', () => {
      const idx = movingCorner.current
      if (idx !== null)
        corners[idx].animate('radius', cornerOptions.radius, {
          onChange: () => canvas.renderAll(),
          duration: 100
        })
      movingCorner.current = null
      lastPtr.current = null
    })
    canvas.renderAll();
    setLoaded(true)
  }, [b, l, r, t, computeCoords, contourOptions, cornerOptions, lazyCoords, leftBias, topBias, startCorners])

  const init = useCallback((canvas: fabric.Canvas) => {
    fabric.Image.fromURL(
      src, img => initSheet(img, canvas, canvas.width!),
      { selectable: false, evented: false }
    )
  }, [initSheet, src])

  const [started, setStarted] = useState(false);

  function animate({ tl, tr, br, bl }: Partial<Corners>, config?: AnimationConfig) {
    const { promise, resolve } = managedPromise<void>();
    let someAnimated = false;
    [tl, tr, br, bl].forEach((v, i) => {
      if (v && cornersRef.current && contourRef.current && imgRef.current && typeof canvas !== 'string') {
        someAnimated = true
        const pos = rescale(v, imgRef.current)
        const c = cornersRef.current[i]
        c.animate({ left: pos[0], top: pos[1] }, {
          ...config, onComplete: resolve, onChange() {
            movePoly([c.left!, c.top!], i, contourRef.current!)
            canvas.renderAll()
          },
        })
      }
    })
    if (!someAnimated)
      resolve()
    return promise
  }

  useEffect(() => {
    if (canvas === "error")
      console.error("[react-mobile-perspective]: Loading Error")
    else if (canvas !== "loading" && !started) {
      console.debug('[CROPPER]: Loading canvas')
      setStarted(true);
      init(canvas);
    }
  }, [init, canvas, started]);

  return { cropper: Canvas, coords, getCoords, animate: Object.assign(animate, {loaded}) }
}

export default useCropper