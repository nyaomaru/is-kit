import Link from "next/link";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { API_ITEMS } from "@/constants/api-items";

export default function ApiIndexPage() {
  const items = API_ITEMS;
  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <Heading variant="h1" className="mb-4">
        API Reference
      </Heading>
      <Paragraph className="text-muted-foreground">
        Explore the available functions and combinators. Use the sidebar to
        navigate.
      </Paragraph>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group focus:outline-none"
          >
            <Card className="h-full transition-colors group-hover:border-primary">
              <CardHeader>
                <div className="inline-block w-fit">
                  <CardTitle className="inline-block text-lg underline-offset-4">
                    {item.title}
                  </CardTitle>
                  <div className="mt-1 h-px w-0 bg-primary transition-[width] duration-500 group-hover:w-full" />
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
