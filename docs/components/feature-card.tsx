import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export type FeatureCardProps = {
  id?: string;
  title: string;
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
