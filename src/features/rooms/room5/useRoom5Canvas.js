import { useEffect, useRef, useState } from 'react'

const WORLD = { width: 960, height: 600 }
const DIRECTIONS = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' }
const isEditableTarget = (target) => target instanceof HTMLElement
  && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

export function useRoom5Canvas({ roomData, onRoomComplete, paused = false }) {
  const canvasRef = useRef(null)
  const playerRef = useRef({ x: 464, y: 500, width: 32, height: 40, direction: 'down', speed: 220 })
  const pressedKeysRef = useRef(new Set())
  const nearbyRef = useRef(null)
  const activeRef = useRef(null)
  const completedRef = useRef(new Set())
  const callbackRef = useRef(onRoomComplete)
  const completedOnceRef = useRef(false)
  const roomMessageRef = useRef('')
  const [nearbyTerminalId, setNearbyTerminalId] = useState(null)
  const [activeTerminalId, setActiveTerminalId] = useState(null)
  const [completedTerminalIds, setCompletedTerminalIds] = useState([])
  const [roomMessage, setRoomMessage] = useState('')
  useEffect(() => { callbackRef.current = onRoomComplete }, [onRoomComplete])

  useEffect(() => {
    if (paused) return undefined
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined
    let frameId = 0; let previousTime = 0; let disposed = false
    const images = {}; const imageElements = []; const player = playerRef.current
    Object.entries(roomData.sprites ?? {}).forEach(([direction, source]) => {
      const image = new Image()
      image.onload = () => { images[direction] = image }
      image.onerror = () => { delete images[direction] }
      imageElements.push(image)
      image.onerror = () => { delete images[direction] }; image.src = source
    })
    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      if (!bounds.width || !bounds.height) return
      const ratio = window.devicePixelRatio || 1
      canvas.width = Math.round(bounds.width * ratio); canvas.height = Math.round(bounds.height * ratio)
      ctx.setTransform(canvas.width / WORLD.width, 0, 0, canvas.height / WORLD.height, 0, 0)
    }
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize()
    const collides = (x, y) => {
      const right = x + player.width; const bottom = y + player.height
      if (x < 20 || right > 940 || bottom > 580) return true
      if (y < 70 && (x + player.width / 2 < 425 || x + player.width / 2 > 535)) return true
      return roomData.map.obstacles.some((wall) => x < wall.x + wall.width && right > wall.x
        && y < wall.y + wall.height && bottom > wall.y)
    }
    const draw = (time) => {
      const delta = Math.min((time - previousTime) / 1000 || 0, 0.04); previousTime = time
      if (!activeRef.current) {
        const keys = pressedKeysRef.current
        const dx = Number(keys.has('ArrowRight') || keys.has('KeyD')) - Number(keys.has('ArrowLeft') || keys.has('KeyA'))
        const dy = Number(keys.has('ArrowDown') || keys.has('KeyS')) - Number(keys.has('ArrowUp') || keys.has('KeyW'))
        if (dx || dy) {
          player.direction = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down')
          const length = Math.hypot(dx, dy); const mx = dx / length * player.speed * delta; const my = dy / length * player.speed * delta
          if (!collides(player.x + mx, player.y)) player.x += mx
          if (!collides(player.x, player.y + my)) player.y += my
        }
      }
      const nearby = roomData.map.terminals.find((item) =>
        Math.hypot(player.x + player.width / 2 - item.x, player.y + player.height / 2 - item.y) < 78) ?? null
      if (nearbyRef.current !== nearby?.id) { nearbyRef.current = nearby?.id ?? null; setNearbyTerminalId(nearbyRef.current) }
      ctx.clearRect(0, 0, WORLD.width, WORLD.height); ctx.fillStyle = '#09131a'; ctx.fillRect(0, 0, WORLD.width, WORLD.height)
      ctx.strokeStyle = 'rgba(80, 190, 180, 0.09)'; ctx.lineWidth = 1
      for (let x = 30; x < 960; x += 40) { ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, 580); ctx.stroke() }
      for (let y = 30; y < 600; y += 40) { ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(940, y); ctx.stroke() }
      ctx.strokeStyle = '#31515a'; ctx.lineWidth = 3; ctx.strokeRect(20, 20, 920, 560)
      ctx.fillStyle = completedRef.current.size === roomData.challenges.length ? '#55f0b5' : '#703f53'
      ctx.fillRect(425, 20, 110, 9); ctx.fillStyle = '#b7c9c7'; ctx.font = '12px system-ui'; ctx.textAlign = 'center'
      ctx.fillText(completedRef.current.size === roomData.challenges.length ? 'SALIDA ABIERTA' : 'SALIDA BLOQUEADA', 480, 48)
      roomData.map.obstacles.forEach((wall) => {
        ctx.fillStyle = '#20333a'; ctx.fillRect(wall.x, wall.y, wall.width, wall.height)
        ctx.strokeStyle = '#3a6268'; ctx.strokeRect(wall.x, wall.y, wall.width, wall.height)
      })
      roomData.map.terminals.forEach((item) => {
        const done = completedRef.current.has(item.id)
        ctx.fillStyle = done ? '#1b705d' : nearbyRef.current === item.id ? '#e5a84c' : '#167f83'
        ctx.shadowColor = '#42d6cb'; ctx.shadowBlur = nearbyRef.current === item.id ? 20 : 8
        ctx.fillRect(item.x - 19, item.y - 19, 38, 38); ctx.shadowBlur = 0
        ctx.strokeStyle = '#9af9ed'; ctx.strokeRect(item.x - 19, item.y - 19, 38, 38)
        ctx.fillStyle = '#e2f5ee'; ctx.font = '11px system-ui'; ctx.fillText(item.label, item.x, item.y + 34)
        ctx.fillStyle = '#071115'; ctx.font = 'bold 15px system-ui'; ctx.fillText(done ? '✓' : '⌘', item.x, item.y + 5)
      })
      const sprite = images[player.direction]
      if (sprite?.complete && sprite.naturalWidth) ctx.drawImage(sprite, player.x, player.y, player.width, player.height)
      else {
        ctx.fillStyle = '#f2cc75'; ctx.fillRect(player.x, player.y, player.width, player.height)
        ctx.fillStyle = '#14232a'; ctx.fillRect(player.x + 5, player.y + 7, 22, 14)
        const p = { up: [16, 3], down: [16, 37], left: [3, 20], right: [29, 20] }[player.direction]
        ctx.fillStyle = '#5cf0cb'; ctx.beginPath(); ctx.arc(player.x + p[0], player.y + p[1], 3, 0, Math.PI * 2); ctx.fill()
      }
      if (player.y < 55 && player.x + player.width / 2 > 425 && player.x + player.width / 2 < 535) {
        if (completedRef.current.size === roomData.challenges.length) {
          if (!completedOnceRef.current) { completedOnceRef.current = true; callbackRef.current?.() }
        } else if (!roomMessageRef.current) {
          roomMessageRef.current = 'Resolvé todos los terminales para abrir la salida.'
          setRoomMessage('Resolvé todos los terminales para abrir la salida.')
        }
      }
      if (!disposed) frameId = requestAnimationFrame(draw)
    }
    const onKeyDown = (event) => {
      if (event.code in DIRECTIONS) {
        if (!activeRef.current && !isEditableTarget(event.target)) { pressedKeysRef.current.add(event.code); event.preventDefault() }
        return
      }
      if (isEditableTarget(event.target)) return
      if (event.code === 'Escape' && activeRef.current) { activeRef.current = null; setActiveTerminalId(null); pressedKeysRef.current.clear() }
      else if ((event.code === 'KeyE' || event.code === 'Space') && nearbyRef.current) {
        event.preventDefault(); activeRef.current = nearbyRef.current; setActiveTerminalId(nearbyRef.current)
        roomMessageRef.current = ''; setRoomMessage(''); pressedKeysRef.current.clear()
      }
    }
    const onKeyUp = (event) => pressedKeysRef.current.delete(event.code)
    window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp)
    frameId = requestAnimationFrame(draw)
    return () => {
      disposed = true; cancelAnimationFrame(frameId); observer.disconnect()
      window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp)
      pressedKeysRef.current.clear()
      imageElements.forEach((image) => { image.onload = null; image.onerror = null; image.src = '' })
    }
  }, [roomData, paused])
  const closeTerminal = () => { activeRef.current = null; setActiveTerminalId(null) }
  const completeTerminal = (terminalId) => {
    if (completedRef.current.has(terminalId)) return
    completedRef.current.add(terminalId); setCompletedTerminalIds([...completedRef.current]); closeTerminal()
  }
  return { canvasRef, nearbyTerminalId, activeTerminalId, completedTerminalIds, roomMessage, closeTerminal, completeTerminal }
}
