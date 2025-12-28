import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Check, Loader2, X, Mail } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type UnsubscribeStatus = "loading" | "confirming" | "success" | "error" | "already_unsubscribed";

export default function UnsubscribeRoute() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<UnsubscribeStatus>("loading");
  const [email, setEmail] = useState<string>("");
  const [category, setCategory] = useState<string>("marketing");
  const [error, setError] = useState<string>("");

  const token = searchParams.get("token");
  const categoryParam = searchParams.get("category");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Invalid unsubscribe link");
      return;
    }

    // Fetch the unsubscribe info
    const fetchInfo = async () => {
      try {
        const response = await fetch(
          `${API_URL}/unsubscribe?token=${token}&category=${categoryParam || "marketing"}`
        );
        const data = await response.json();

        if (response.ok) {
          setEmail(data.email);
          setCategory(data.category || "marketing");
          setStatus("confirming");
        } else {
          setStatus("error");
          setError(data.error || "Invalid unsubscribe link");
        }
      } catch {
        setStatus("error");
        setError("Failed to process unsubscribe request");
      }
    };

    fetchInfo();
  }, [token, categoryParam]);

  const handleUnsubscribe = async () => {
    setStatus("loading");

    try {
      const response = await fetch(`${API_URL}/unsubscribe?token=${token}&category=${category}`, {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        setStatus("success");
      } else if (response.status === 404) {
        setStatus("error");
        setError("Email address not found");
      } else {
        setStatus("error");
        setError(data.error || "Failed to unsubscribe");
      }
    } catch {
      setStatus("error");
      setError("Failed to process unsubscribe request");
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "marketing":
        return "marketing emails";
      case "product_updates":
        return "product update emails";
      default:
        return "emails";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Processing...</p>
          </>
        )}

        {status === "confirming" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="mt-6 text-xl font-semibold text-foreground">Unsubscribe from emails</h1>
            <p className="mt-2 text-muted-foreground">
              Are you sure you want to unsubscribe{" "}
              <span className="font-medium text-foreground">{email}</span> from{" "}
              {getCategoryLabel(category)}?
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                to="/"
                className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-secondary"
              >
                Cancel
              </Link>
              <button
                onClick={handleUnsubscribe}
                className="flex-1 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/90"
              >
                Unsubscribe
              </button>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mt-6 text-xl font-semibold text-foreground">
              Unsubscribed successfully
            </h1>
            <p className="mt-2 text-muted-foreground">
              You've been unsubscribed from {getCategoryLabel(category)}. You can manage your email
              preferences in your{" "}
              <Link to="/profile" className="text-foreground underline">
                profile settings
              </Link>
              .
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-md bg-foreground px-6 py-2 text-sm font-medium text-background transition hover:bg-foreground/90"
            >
              Go to homepage
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="mt-6 text-xl font-semibold text-foreground">Something went wrong</h1>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-md bg-foreground px-6 py-2 text-sm font-medium text-background transition hover:bg-foreground/90"
            >
              Go to homepage
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
