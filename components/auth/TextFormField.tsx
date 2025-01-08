import { capitalCase } from "change-case";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

export function TextFormField({
  control,
  name,
  placeholder = "",
  onChange = () => {},
  autoComplete = "",
}: {
  control: never;
  name: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  autoComplete?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="mt-4">
          <FormLabel>{capitalCase(name)}:</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              {...field}
              onChange={(e) => {
                field.onChange(e);
                onChange(e.target.value);
              }}
              autoComplete={autoComplete}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
