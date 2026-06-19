import { Link } from 'react-router-dom'
import { useScrollReveal } from '../utils/hooks'

interface Props {
  children: React.ReactNode
  className?: string
  delay?: 1 | 2 | 3 | 4 | 5
}

export default function Reveal({ children, className = '', delay }: Props) {
  const { ref, isVisible } = useScrollReveal(0.05)

  return (
    <div
      ref={ref}
      className={`reveal ${isVisible ? 'visible' : ''} ${delay ? `reveal-delay-${delay}` : ''} ${className}`}
    >
      {children}
    </div>
  )
}
