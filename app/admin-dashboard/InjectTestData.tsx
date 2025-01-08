import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { createProperty } from "@/lib/dataActions";
import { PropertyStatusList } from "@/lib/types";
import { faker } from "@faker-js/faker";
import { useState } from "react";

export function InjectTestData({ className }: { className?: string }) {
  const [count, setCount] = useState(100);
  const [progress, setProgress] = useState(-1);
  const { toast } = useToast();

  const injectTestData = async () => {
    try {
      setProgress(0);
      let completed = 0;

      const promises = Array.from({ length: count }, async () => {
        const response = await fetch(
          "https://jaspervdj.be/lorem-markdownum/markdown.txt"
        );
        const text = await response.text();

        const data = {
          status: faker.helpers.arrayElement(PropertyStatusList),
          price: faker.number.int({ min: 100000, max: 1000000 }),
          addressLine1: faker.location.streetAddress(),
          addressLine2: faker.location.secondaryAddress(),
          city: faker.location.city(),
          postcode: faker.location.zipCode(),
          bedrooms: faker.number.int({ min: 1, max: 5 }),
          bathrooms: faker.number.int({ min: 1, max: 5 }),
          description: text,
          images: Array.from(
            { length: faker.number.int({ min: 0, max: 5 }) },
            () => faker.image.url()
          ),
        };

        const createResponse = await createProperty(data);
        completed++;
        setProgress((completed / count) * 100);
        return createResponse;
      });

      await Promise.all(promises);
      toast({
        title: `Successfully injected ${completed} fake properties`,
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Failed to inject fake properties",
        description:
          error instanceof Error ? error.message : JSON.stringify(error),
        variant: "destructive",
      });
    } finally {
      setProgress(-1);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="flex flex-row items-center gap-2">
          <Input
            type="number"
            className="w-24 h-8"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
          <Button
            size="sm"
            variant="destructive"
            className="uppercase tracking-widest"
            onClick={injectTestData}
            disabled={progress !== -1}
          >
            Inject test data
          </Button>
        </div>
        {progress > 0 && <Progress value={progress} className="w-full" />}
      </CardContent>
    </Card>
  );
}
