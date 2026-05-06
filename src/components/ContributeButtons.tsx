import styles from './ContributeButtons.module.css'

interface ExtraLink {
  label: string
  description: string
  url: string
}

interface ContributeButtonsProps {
  suggestEntryUrl: string
  suggestEntryDescription?: string
  extraLinks?: ExtraLink[]
}

export default function ContributeButtons({
  suggestEntryUrl,
  suggestEntryDescription,
  extraLinks,
}: ContributeButtonsProps) {
  return (
    <div className={styles.wrapper}>
      <a href={suggestEntryUrl} target="_blank" rel="noopener noreferrer">
        <p className="paragraph-default-bold padding-bottom-8px">
          Suggest listing <span className="color-teal-400">&rarr;</span>
        </p>
        <p className="paragraph-small color-teal-300">
          {suggestEntryDescription || 'Suggest a resource to be published here'}
        </p>
      </a>
      {extraLinks?.map(link => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <p className="paragraph-default-bold padding-bottom-8px">
            {link.label} <span className="color-teal-400">&rarr;</span>
          </p>
          <p className="paragraph-small color-teal-300">{link.description}</p>
        </a>
      ))}
    </div>
  )
}
