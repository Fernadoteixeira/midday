import { getTeamBankConnections } from "@midday/supabase/queries";
import { createClient } from "@midday/supabase/server";
import { Avatar, AvatarImage } from "@midday/ui/avatar";
import { Button } from "@midday/ui/button";
import { Icons } from "@midday/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@midday/ui/popover";
import { cn } from "@midday/ui/utils";
import { differenceInDays, formatDistanceToNow } from "date-fns";
import { ReconnectButton } from "./reconnect-button";

const WARNING_DAYS = 14;
const ERROR_DAYS = 7;

export async function ReconnectBank() {
  const supabase = createClient();
  const { data } = await getTeamBankConnections(supabase);

  const hasWarningStatus = data.some(
    (bank) =>
      differenceInDays(new Date(bank.expires_at), new Date()) <= WARNING_DAYS,
  );

  const hasErrorStatus = data.some(
    (bank) =>
      differenceInDays(new Date(bank.expires_at), new Date()) <= ERROR_DAYS,
  );

  if (!data.length) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-8 h-8 flex items-center"
        >
          <Icons.Refresh
            size={16}
            className={cn(
              hasWarningStatus && "text-[#FFD02B]",
              hasErrorStatus && "text-[#FF3638]",
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="rounded-xl w-[350px] mr-7" sideOffset={10}>
        <div>
          {data?.map((bank) => {
            const expiresInDays = differenceInDays(
              new Date(bank.expires_at),
              new Date(),
            );

            return (
              <div
                className="flex justify-between pt-2 pb-2 items-center"
                key={bank.id}
              >
                <div className="flex items-center">
                  <Avatar className="flex h-8 w-8 items-center justify-center space-y-0 border">
                    <AvatarImage src={bank.logo_url} alt={bank.name} />
                  </Avatar>
                  <div className="ml-4 flex flex-col">
                    <p className="text-xs font-medium leading-none mb-1">
                      {bank.name}
                    </p>

                    <span
                      className={cn(
                        "text-xs text-[#606060]",
                        expiresInDays <= WARNING_DAYS && "text-[#FFD02B]",
                        expiresInDays <= ERROR_DAYS && "text-[#FF3638]",
                      )}
                    >
                      Expires in{" "}
                      {formatDistanceToNow(new Date(bank.expires_at))}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <ReconnectButton
                    id={bank.id}
                    institutionId={bank.institution_id}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}