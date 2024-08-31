import type { FC } from "react";

import { nanoid } from "nanoid";

import { config } from "@/app/config";

interface HistoryProps {
  history: string[];
}

export const History: FC<HistoryProps> = ({ history }) => {
  return (
    <>
      {history.map((entry) => (
        <div key={entry + nanoid()} className="text-sm">
          {entry.startsWith("command:") ? (
            <div className="flex flex-row space-x-2">
              <label htmlFor="prompt" className="flex-shrink">
                {config.ps1_username}
                <span className="text-yellow-200">@</span>
                {config.ps1_hostname}
                <span className="text-yellow-200">:$ ~ </span>
              </label>
              <span>{entry.slice(8)}</span>
            </div>
          ) : (
            <span>{entry}</span>
          )}
        </div>
      ))}
    </>
  );
};
