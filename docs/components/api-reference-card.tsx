import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';

type ApiReferenceField = {
  /** Parameter or option identifier displayed in code font. */
  name: string;
  /** Type or shape shown alongside the identifier. */
  type: string;
  /** Optional explanatory blurb for the entry. */
  description?: string;
};

type ApiReferenceCardProps = {
  /** Title rendered at the top of the reference card. */
  title: string;
  /** Introductory text summarising the API surface. */
  description?: string;
  /** List of positional or required parameters. */
  parameters?: ApiReferenceField[];
  /** Additional options or configuration entries. */
  options?: ApiReferenceField[];
};

export function APIReferenceCard({
  title,
  description,
  parameters,
  options,
}: ApiReferenceCardProps) {
  return (
    <div className='rounded-md border p-4'>
      <Heading variant='h3' className='mb-1'>
        {title}
      </Heading>
      {description ? (
        <Paragraph variant='muted' className='text-sm mb-3'>
          {description}
        </Paragraph>
      ) : null}

      {parameters && parameters.length > 0 ? (
        <div className='mb-3'>
          <Heading variant='h4'>Parameters</Heading>
          <ul className='mt-1 space-y-1 text-sm'>
            {parameters.map((p) => (
              <li key={p.name}>
                <code>{p.name}</code>: <em>{p.type}</em>
                {p.description ? <span> — {p.description}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {options && options.length > 0 ? (
        <div>
          <Heading variant='h4'>Options</Heading>
          <ul className='mt-1 space-y-1 text-sm'>
            {options.map((o) => (
              <li key={o.name}>
                <code>{o.name}</code>: <em>{o.type}</em>
                {o.description ? <span> — {o.description}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
