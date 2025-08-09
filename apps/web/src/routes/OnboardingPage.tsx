import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";

const inputBase =
  "h-11 rounded-xl border border-border bg-background px-3.5 text-[15px] outline-none focus:ring-2 ring-ring transition";

const OnboardingPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const info = await authService.fetchSetupInfo(token);
        setEmail(info.email || "");
        setName(info.name || "");
        setPhone(info.phone || "");
      } catch (e: any) {
        setError(
          e?.response?.data?.message || "Invalid or expired invite link"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password || password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      await authService.completeSetup({ token, name, phone, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to complete setup");
    }
  };

  if (loading) return <div className="container py-6">Loading...</div>;
  if (error && !success)
    return <div className="container py-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card/60 p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up your profile and password to get started.
          </p>
          <form onSubmit={onSubmit} className="mt-4 grid gap-3">
            <input
              className={inputBase + " opacity-60 pointer-events-none"}
              value={email}
              readOnly
            />
            <input
              className={inputBase}
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className={inputBase}
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <input
              className={inputBase}
              placeholder="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              className={inputBase}
              placeholder="Confirm password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <Button type="submit">Complete Setup</Button>
            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && (
              <div className="text-sm text-emerald-600">
                Success! Redirecting…
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
