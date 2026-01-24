import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';

export type FeatureCardProps = {
  /** Optional anchor target used to link directly to the card. */
  id?: string;
  /** Heading text rendered at the top of the card. */
  title: string;
  /** Supporting copy that explains the feature. */
  description: string;
};

export function FeatureCard({ title, description, id }: FeatureCardProps) {
  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle className='text-lg'>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
