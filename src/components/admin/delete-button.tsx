"use client";

import type { ButtonHTMLAttributes } from "react";

type DeleteButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  message?: string;
};

export function DeleteButton({ message = "确认删除这条记录？", onClick, ...props }: DeleteButtonProps) {
  return (
    <button
      {...props}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
          return;
        }

        onClick?.(event);
      }}
      type="submit"
    />
  );
}
