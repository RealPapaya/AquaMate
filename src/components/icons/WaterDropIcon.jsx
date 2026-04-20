export default function WaterDropIcon({ size = 24, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="dropGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00e5f0" />
          <stop offset="100%" stopColor="#0099b8" />
        </linearGradient>
      </defs>
      <path 
        d="M12 2.5C12 2.5 6 10.5 6 14.5C6 18.5 8.68 21.5 12 21.5C15.32 21.5 18 18.5 18 14.5C18 10.5 12 2.5 12 2.5Z" 
        fill="url(#dropGradient)"
        opacity="0.95"
      />
      <ellipse 
        cx="9" 
        cy="12" 
        rx="1.5" 
        ry="2.5" 
        fill="white" 
        opacity="0.3" 
        transform="rotate(-20 9 12)"
      />
    </svg>
  )
}
