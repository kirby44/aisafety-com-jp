import Link from 'next/link'
import UpButton from './UpButton'

export default function Footer() {
  return (
    <footer className="margin-top-192px padding-bottom-24px">
      <div className="container-default">
        <p
          className="paragraph-small opacity-80"
          style={{ textAlign: 'center' }}
        >
          Forked with gratitude from{' '}
          <Link
            href="https://www.aisafety.com/map"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--bright-teal-300)',
              textDecoration: 'underline',
            }}
          >
            AISafety.com
          </Link>
          , whose team generously shared their code with us. Thanks to Bryce
          Robertson, Søren Elverlin, and the Stampy team.
        </p>
      </div>

      <UpButton />
    </footer>
  )
}
