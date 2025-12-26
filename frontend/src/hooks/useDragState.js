import { useState, useRef } from 'react'

export function useDragState() {
  const [isDragging, setIsDragging] = useState(false)
  const dragQueue = useRef([])

  function startDrag(event) {
    if (isDragging) {
      dragQueue.current.push(event)
      return false
    }
    setIsDragging(true)
    return true
  }

  function endDrag() {
    setIsDragging(false)
    
    // Process next queued drag if any
    if (dragQueue.current.length > 0) {
      const nextDrag = dragQueue.current.shift()
      // You would trigger the next drag here
    }
  }

  return {
    isDragging,
    dragQueue: dragQueue.current,
    startDrag,
    endDrag,
  }
}
