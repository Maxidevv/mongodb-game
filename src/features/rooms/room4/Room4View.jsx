import { useEffect, useRef } from 'react'
import { render as renderRoom4 } from './room4.js'
import '../../../rooms/room4.css'

export default function Room4View({ onRoomComplete, paused = false }) {
  const mountRef = useRef(null)
  const roomRef = useRef(null)
  const onCompleteRef = useRef(onRoomComplete)
  const pausedRef = useRef(paused)

  useEffect(() => {
    onCompleteRef.current = onRoomComplete
  }, [onRoomComplete])

  useEffect(() => {
    pausedRef.current = paused
    roomRef.current?.setPaused(paused)
  }, [paused])

  useEffect(() => {
    let roomInstance
    const container = mountRef.current
    if (!container) return undefined

    roomInstance = renderRoom4(container, {
      onRoomComplete: () => onCompleteRef.current?.(),
      paused: pausedRef.current,
    })
    roomRef.current = roomInstance

    return () => {
      roomInstance?.destroy()
      if (roomRef.current === roomInstance) roomRef.current = null
    }
  }, [])

  return <div ref={mountRef} />
}
