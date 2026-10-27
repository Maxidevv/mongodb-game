import { useEffect, useRef, useState } from 'react'

const WORLD = { width: 960, height: 600 }
const DIRECTIONS = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
}

function isEditableTarget(target) {
  return target instanceof HTMLElement
    && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
}

export function useRoom2Canvas({ roomData, onRoomComplete, paused = false }) {
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
    const context = canvas.getContext('2d')
    if (!context) return undefined
    let frameId = 0
    let previousTime = 0
    let disposed = false
    const images = {}
    const imageElements = []
    const player = playerRef.current

    Object.entries(roomData.sprites ?? {}).forEach(([direction, source]) => {
      const image = new Image()
      imageElements.push(image)
      image.onload = () => { images[direction] = image }
      image.onerror = () => { delete images[direction] }
      image.src = source
    })

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect()
      if (!bounds.width || !bounds.height) return
      const ratio = window.devicePixelRatio || 1
      canvas.width = Math.round(bounds.width * ratio)
      canvas.height = Math.round(bounds.height * ratio)
      context.setTransform(canvas.width / WORLD.width, 0, 0, canvas.height / WORLD.height, 0, 0)
    }
    const observer = new ResizeObserver(resizeCanvas)
    observer.observe(canvas)
    resizeCanvas()

    const intersects = (x, y) => {
      const right = x + player.width
      const bottom = y + player.height
      if (x < 20 || right > WORLD.width - 20 || bottom > WORLD.height - 20) return true
      if (y < 70 && (x + player.width / 2 < 425 || x + player.width / 2 > 535)) return true
      return roomData.map.obstacles.some((wall) =>
        x < wall.x + wall.width && right > wall.x
        && y < wall.y + wall.height && bottom > wall.y)
    }

    const draw = (time) => {
      const delta = Math.min((time - previousTime) / 1000 || 0, 0.04)
      previousTime = time
      if (!activeRef.current) {
        const keys = pressedKeysRef.current
        let dx = 0
        let dy = 0
        if (keys.has('ArrowUp') || keys.has('KeyW')) dy -= 1
        if (keys.has('ArrowDown') || keys.has('KeyS')) dy += 1
        if (keys.has('ArrowLeft') || keys.has('KeyA')) dx -= 1
        if (keys.has('ArrowRight') || keys.has('KeyD')) dx += 1
        if (dx || dy) {
          player.direction = Math.abs(dx) > Math.abs(dy)
            ? (dx < 0 ? 'left' : 'right')
            : (dy < 0 ? 'up' : 'down')
          const length = Math.hypot(dx, dy) || 1
          const stepX = dx / length * player.speed * delta
          const stepY = dy / length * player.speed * delta
          if (!intersects(player.x + stepX, player.y)) player.x += stepX
          if (!intersects(player.x, player.y + stepY)) player.y += stepY
        }
      }

      const terminal = roomData.map.terminals.find((item) =>
        Math.hypot(player.x + player.width / 2 - item.x, player.y + player.height / 2 - item.y) < 78) ?? null
      if (nearbyRef.current !== terminal?.id) {
        nearbyRef.current = terminal?.id ?? null
        setNearbyTerminalId(nearbyRef.current)
      }

      context.clearRect(0, 0, WORLD.width, WORLD.height)
      context.fillStyle = '#09131a'
      context.fillRect(0, 0, WORLD.width, WORLD.height)
      context.strokeStyle = 'rgba(80, 190, 180, 0.09)'
      context.lineWidth = 1
      for (let x = 30; x < WORLD.width; x += 40) {
        context.beginPath(); context.moveTo(x, 20); context.lineTo(x, WORLD.height - 20); context.stroke()
      }
      for (let y = 30; y < WORLD.height; y += 40) {
        context.beginPath(); context.moveTo(20, y); context.lineTo(WORLD.width - 20, y); context.stroke()
      }
      context.strokeStyle = '#31515a'
      context.lineWidth = 3
      context.strokeRect(20, 20, WORLD.width - 40, WORLD.height - 40)
      context.fillStyle = completedRef.current.size === roomData.challenges.length ? '#55f0b5' : '#703f53'
      context.fillRect(425, 20, 110, 9)
      context.fillStyle = '#b7c9c7'
      context.font = '12px system-ui'
      context.textAlign = 'center'
      context.fillText(completedRef.current.size === roomData.challenges.length ? 'SALIDA ABIERTA' : 'SALIDA BLOQUEADA', 480, 48)

      roomData.map.obstacles.forEach((wall) => {
        context.fillStyle = '#20333a'; context.fillRect(wall.x, wall.y, wall.width, wall.height)
        context.strokeStyle = '#3a6268'; context.strokeRect(wall.x, wall.y, wall.width, wall.height)
      })
      roomData.map.terminals.forEach((item) => {
        const isDone = completedRef.current.has(item.id)
        context.fillStyle = isDone ? '#1b705d' : nearbyRef.current === item.id ? '#e5a84c' : '#167f83'
        context.shadowColor = '#42d6cb'
        context.shadowBlur = nearbyRef.current === item.id ? 20 : 8
        context.fillRect(item.x - 19, item.y - 19, 38, 38)
        context.shadowBlur = 0
        context.strokeStyle = '#9af9ed'; context.strokeRect(item.x - 19, item.y - 19, 38, 38)
        context.fillStyle = '#e2f5ee'; context.font = '11px system-ui'; context.fillText(item.label, item.x, item.y + 34)
        context.fillStyle = '#071115'; context.font = 'bold 15px system-ui'; context.fillText(isDone ? '✓' : '⌘', item.x, item.y + 5)
      })

      const sprite = images[player.direction]
      if (sprite?.complete && sprite.naturalWidth) {
        context.drawImage(sprite, player.x, player.y, player.width, player.height)
      } else {
        context.fillStyle = '#f2cc75'; context.fillRect(player.x, player.y, player.width, player.height)
        context.fillStyle = '#14232a'; context.fillRect(player.x + 5, player.y + 7, 22, 14)
        const point = { up: [16, 3], down: [16, 37], left: [3, 20], right: [29, 20] }[player.direction]
        context.fillStyle = '#5cf0cb'; context.beginPath()
        context.arc(player.x + point[0], player.y + point[1], 3, 0, Math.PI * 2); context.fill()
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
        if (!activeRef.current && !isEditableTarget(event.target)) {
          pressedKeysRef.current.add(event.code); event.preventDefault()
        }
        return
      }
      if (isEditableTarget(event.target)) return
      if (event.code === 'Escape' && activeRef.current) {
        activeRef.current = null; setActiveTerminalId(null); pressedKeysRef.current.clear()
      } else if ((event.code === 'KeyE' || event.code === 'Space') && nearbyRef.current) {
        event.preventDefault(); activeRef.current = nearbyRef.current
        setActiveTerminalId(nearbyRef.current); roomMessageRef.current = ''; setRoomMessage(''); pressedKeysRef.current.clear()
      }
    }
    const onKeyUp = (event) => pressedKeysRef.current.delete(event.code)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
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
    completedRef.current.add(terminalId)
    setCompletedTerminalIds([...completedRef.current])
    closeTerminal()
  }

  return { canvasRef, nearbyTerminalId, activeTerminalId, completedTerminalIds, roomMessage, closeTerminal, completeTerminal }
}
