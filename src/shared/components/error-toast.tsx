import { toast } from "sonner";

export function showErrorToast(error: unknown, fallback = "Something went wrong") {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : fallback;
  toast.error(message);
}
