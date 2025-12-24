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
      const response = await fetch(
        `${API_URL}/unsubscribe?token=${token}&category=${category}`,
        { method: "POST" }
      );
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-slate-400" />
            <p className="mt-4 text-slate-600">Processing...</p>
          </>
        )}

        {status === "confirming" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Mail className="h-8 w-8 text-slate-600" />
            </div>
            <h1 className="mt-6 text-xl font-semibold text-slate-900">
              Unsubscribe from emails
            </h1>
            <p className="mt-2 text-slate-600">
              Are you sure you want to unsubscribe{" "}
              <span className="font-medium text-slate-900">{email}</span> from{" "}
              {getCategoryLabel(category)}?
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                to="/"
                className="flex-1 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                onClick={handleUnsubscribe}
                className="flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
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
            <h1 className="mt-6 text-xl font-semibold text-slate-900">
              Unsubscribed successfully
            </h1>
            <p className="mt-2 text-slate-600">
              You've been unsubscribed from {getCategoryLabel(category)}. You can
              manage your email preferences in your{" "}
              <Link to="/profile" className="text-slate-900 underline">
                profile settings
              </Link>
              .
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-md bg-slate-900 px-6 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
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
            <h1 className="mt-6 text-xl font-semibold text-slate-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-slate-600">{error}</p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-md bg-slate-900 px-6 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Go to homepage
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
