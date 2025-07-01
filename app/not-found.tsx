export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '3rem 2rem',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <h1 style={{ 
          fontSize: '6rem', 
          fontWeight: 'bold', 
          margin: '0 0 1rem 0',
          background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>404</h1>
        <h2 style={{ 
          fontSize: '2rem', 
          margin: '0 0 1rem 0' 
        }}>Page Not Found</h2>
        <p style={{ 
          fontSize: '1.1rem', 
          margin: '0 0 2rem 0',
          opacity: 0.9,
          lineHeight: 1.6
        }}>
          The page you're looking for doesn't exist.
        </p>
        <a 
          href="/" 
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          Return Home
        </a>
      </div>
    </div>
  )
} 