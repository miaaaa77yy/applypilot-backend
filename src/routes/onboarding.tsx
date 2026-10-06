import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import {
  BasicsFields,
  PreferenceFields,
  ResumeUpload,
  basicsToProfile,
  toBasicsDraft,
  toPrefsDraft,
  validateBasics,
} from "@/components/app/ProfileFields";
import { CompanyLogo, RecBadge } from "@/components/app/badges";
import { fmtSalary, rankScore, recommendationFor } from "@/lib/data";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — ApplyPilot" },
      { name: "description", content: "Add your resume and preferences to get a personalized job shortlist." },
      { property: "og:title", content: "Get started — ApplyPilot" },
      { property: "og:description", content: "Add your resume and preferences to get a personalized job shortlist." },
    ],
  }),
  component: Onboarding,
});

const steps = ["Profile & Resume", "Career Preferences", "Your Shortlist"];

function Onboarding() {
  const store = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [basics, setBasics] = useState(toBasicsDraft(store.profile));
  const [prefs, setPrefs] = useState(toPrefsDraft(store.profile));
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (store.hydrated) {
      setBasics(toBasicsDraft(store.profile));
      setPrefs(toPrefsDraft(store.profile));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.hydrated]);

  const errors = validateBasics(basics);
  const valid = Object.keys(errors).length === 0;

  const shortlist = useMemo(
    () => [...store.jobs].sort((a, b) => rankScore(b, store.profile) - rankScore(a, store.profile)).slice(0, 4),
    [store.jobs, store.profile],
  );

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Plane className="size-4" /></div>
          <span className="text-lg font-bold">ApplyPilot</span>
        </div>

        <ol className="mb-8 grid grid-cols-3 gap-2">
          {steps.map((s, i) => (
            <li key={s}>
              <div className={`h-1.5 rounded-full ${i <= step ? "bg-teal" : "bg-border"}`} />
              <p className={`mt-2 text-xs font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                Step {i + 1} of 3 · {s}
              </p>
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
          {step === 0 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setTried(true);
                if (!valid) return;
                store.setProfile(basicsToProfile(basics));
                setStep(1);
              }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl font-bold">Add your resume</h1>
                <p className="mt-1 text-muted-foreground">We’ll turn your resume into a candidate profile for you to review.</p>
              </div>
              <ResumeUpload fileName={store.profile.resumeName} onChange={(resumeName) => store.setProfile({ resumeName })} />
              <div className="border-t pt-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your profile</h2>
                <BasicsFields draft={basics} onChange={setBasics} errors={tried ? errors : {}} />
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={tried && !valid}>
                  Continue to Preferences <ArrowRight />
                </Button>
              </div>
            </form>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Career preferences</h1>
                <p className="mt-1 text-muted-foreground">Tell us what you’re looking for so we can rank jobs for you.</p>
              </div>
              <PreferenceFields draft={prefs} onChange={setPrefs} />
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(0)}><ArrowLeft /> Back</Button>
                <Button
                  size="lg"
                  onClick={() => {
                    store.setProfile(prefs);
                    setStep(2);
                  }}
                >
                  Save and View My Shortlist <ArrowRight />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Your personalized shortlist</h1>
                <p className="mt-1 text-muted-foreground">
                  Jobs are ranked using your <strong className="text-foreground">profile</strong>, hard{" "}
                  <strong className="text-foreground">eligibility constraints</strong> (like sponsorship and experience),
                  and your <strong className="text-foreground">preferences</strong> for role, location, salary, and company type.
                </p>
              </div>
              <ul className="space-y-2">
                {shortlist.map((j, i) => (
                  <li key={j.id} className="flex items-center gap-3 rounded-xl border p-3">
                    <span className="w-5 text-center text-sm font-bold text-muted-foreground">{i + 1}</span>
                    <CompanyLogo name={j.company} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{j.title}</p>
                      <p className="text-sm text-muted-foreground">{j.company} · {j.location} · {fmtSalary(j.salaryMin, j.salaryMax)}</p>
                    </div>
                    <RecBadge rec={recommendationFor(j, store.profile)} />
                  </li>
                ))}
              </ul>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft /> Back</Button>
                <Button
                  size="lg"
                  onClick={() => {
                    store.completeOnboarding();
                    navigate({ to: "/" });
                  }}
                >
                  Go to Dashboard <ArrowRight />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
