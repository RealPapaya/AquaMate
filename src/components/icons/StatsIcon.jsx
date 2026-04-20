export default function StatsIcon({ size = 24, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="4" y="14" width="4" height="7" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="10" y="9" width="4" height="12" rx="1" fill="currentColor" opacity="0.8" />
      <rect x="16" y="4" width="4" height="17" rx="1" fill="currentColor" />
    </svg>
  )
}
