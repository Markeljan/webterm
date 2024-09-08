import { FC } from "react";

import { nanoid } from "nanoid";

import { HistoryItem } from "@/lib/hooks/use-terminal";
import { cn } from "@/lib/utils";

type HistoryProps = {
  history: HistoryItem[];
};

export const History: FC<HistoryProps> = ({ history }) => {
  return (
    <div className="flex flex-col">
      {history.map(({ ps1, value, isValidCommand }) => (
        <div key={`${ps1}-${nanoid()}`} className="flex flex-col">
          <span className="text-cyan-400">{ps1}</span>
          {!value ? (
            <br />
          ) : ps1 ? (
            <CommandSpan value={value} isValid={isValidCommand} />
          ) : (
            <span className="text-white">{value}</span>
          )}
        </div>
      ))}
    </div>
  );
};

const CommandSpan: FC<{ value: string; isValid?: boolean }> = ({ value, isValid }) => {
  const parts = value.split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1).join(" ");

  return (
    <>
      <div className="flex flex-row space-x-2">
        <span
          className={cn({
            "text-green-400": isValid,
            "text-red-400": !isValid,
          })}
        >
          →
        </span>
        <span
          className={cn({
            "text-green-400": isValid,
            "text-red-400": !isValid,
          })}
        >
          {command}
        </span>
        {args && <span> {args}</span>}
      </div>
    </>
  );
};
