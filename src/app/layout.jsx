// app/layout.jsx
import './globals.css'

export const metadata = {
  title: 'AR Scene',
  description: 'Next.js AR with React Three Fiber',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  )
}
