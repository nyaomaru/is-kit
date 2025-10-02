import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';

type ApiReferenceCardProps = {
  title: string;
  description?: string;
  parameters?: { name: string; type: string; description?: string }[];
  options?: { name: string; type: string; description?: string }[];
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
