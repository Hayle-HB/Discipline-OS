interface AuthAlertProps {
  variant: "error" | "success";
  message: string;
}

export function AuthAlert({ variant, message }: AuthAlertProps) {
  const styles =
    variant === "error"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 text-sm ${styles}`}
    >
      {message}
    </div>
  );
}
