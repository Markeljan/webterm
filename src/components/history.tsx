import { FC } from "react";

import { nanoid } from "nanoid";

import { terminalConfig } from "@/lib/config";
import { HistoryItem } from "@/lib/hooks/use-terminal";
import { isValidCommand } from "@/lib/commands";

type HistoryProps = {
  history: HistoryItem[];
};

export const History: FC<HistoryProps> = ({ history }) => {
  return (
    <>
      {history.map(({ type, value }) => (
        <div key={nanoid()}>
          {type === "command" && (
            <span className="text-cyan-400">
              {`${terminalConfig.ps1_username}@${terminalConfig.ps1_hostname}:$ ~ `}
            </span>
          )}
          {type === "command" ? <CommandSpan value={value} /> : <span className="text-white">{value}</span>}
        </div>
      ))}
    </>
  );
};

const CommandSpan: FC<{ value: string }> = ({ value }) => {
  const parts = value.split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1).join(" ");

  return (
    <>
      <span className={isValidCommand(command) ? "text-green-400" : "text-red-400"}>{command}</span>
      {args && <span className="text-white"> {args}</span>}
    </>
  );
};
