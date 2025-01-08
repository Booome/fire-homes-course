import { capitalCase } from "change-case";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

export function PasswordFormField({
  control,
  name,
  onChange = () => {},
  autoComplete = "",
}: {
  control: never;
  name: string;
  onChange?: (value: string) => void;
  autoComplete?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="mt-4">
          <FormLabel>{capitalCase(name)}:</FormLabel>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              {...field}
              onChange={(e) => {
                field.onChange(e);
                onChange(e.target.value);
              }}
              autoComplete={autoComplete}
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={toggleShowPassword}
              type="button"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
