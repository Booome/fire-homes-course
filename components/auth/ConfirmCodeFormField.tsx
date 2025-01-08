import { capitalCase } from "change-case";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function ConfirmCodeFormField({
  control,
  name,
  email,
  onSendConfirmCode,
  timeout,
  timeoutOnStart = false,
  onChange = () => {},
}: {
  control: never;
  name: string;
  email: string;
  onSendConfirmCode: () => Promise<boolean>;
  timeout: number;
  timeoutOnStart?: boolean;
  onChange?: (value: string) => void;
}) {
  const [confirmCodeTimer, setConfirmCodeTimer] = useState(
    timeoutOnStart ? timeout : 0
  );

  useEffect(() => {
    const cleanInterval = setInterval(() => {
      setConfirmCodeTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(cleanInterval);
  }, [timeout]);

  const handleSendConfirmCode = async () => {
    const success = await onSendConfirmCode();
    if (success) {
      setConfirmCodeTimer(timeout);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="mt-4">
          <FormLabel>{capitalCase(name)}:</FormLabel>
          <div className="flex flex-row items-center gap-2">
            <Input
              type="text"
              placeholder=""
              {...field}
              onChange={(e) => {
                field.onChange(e);
                onChange(e.target.value);
              }}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendConfirmCode}
                    disabled={confirmCodeTimer > 0}
                    className="w-16 text-sm font-normal"
                  >
                    {confirmCodeTimer > 0 ? confirmCodeTimer : <RefreshCw />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Resend confirmation code</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {confirmCodeTimer > 0 && (
            <p className="text-xs text-gray-500">
              Confirmation code sent to {email}
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
