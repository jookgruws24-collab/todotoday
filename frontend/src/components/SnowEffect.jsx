import { useEffect } from 'react'

export default function SnowEffect() {
  useEffect(() => {
    const createSnowflake = () => {
      const snowflake = document.createElement('div')
      snowflake.classList.add('snowflake')
      snowflake.innerHTML = '❅'
      snowflake.style.left = Math.random() * 100 + 'vw'
      snowflake.style.animationDuration = Math.random() * 3 + 2 + 's'
      snowflake.style.opacity = Math.random()
      snowflake.style.fontSize = Math.random() * 10 + 10 + 'px'
      
      document.getElementById('snow-container').appendChild(snowflake)
      
      setTimeout(() => {
        snowflake.remove()
      }, 5000)
    }
    
    const interval = setInterval(createSnowflake, 100)
    
    return () => clearInterval(interval)
  }, [])
  
  return <div id="snow-container" className="fixed inset-0 pointer-events-none z-50" />
}
