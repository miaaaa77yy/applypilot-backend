import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, Card } from "@/components/app/AppShell";
import {
  BasicsFields,
  PreferenceFields,
  ResumeUpload,
  basicsToProfile,
  toBasicsDraft,
  toPrefsDraft,
  validateBasics,
} from "@/components/app/ProfileFields";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — ApplyPilot" },
      { name: "description", content: "Edit your resume, profile, and career preferences." },
      { property: "og:title", content: "Profile — ApplyPilot" },
      { property: "og:description", content: "Edit your resume, profile, and career preferences." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const s = useStore();
  const [basics, setBasics] = useState(toBasicsDraft(s.profile));
  const [prefs, setPrefs] = useState(toPrefsDraft(s.profile));
  useEffect(() => {
    setBasics(toBasicsDraft(s.profile));
    setPrefs(toPrefsDraft(s.profile));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.hydrated]);
  const errors = validateBasics(basics);
  const valid = Object.keys(errors).length === 0;

  return (
    <AppShell
      title="Profile"
      subtitle="Changes here re-rank your recommendations."
      actions={
        <Button
          disabled={!valid}
          onClick={() => {
            s.setProfile({ ...basicsToProfile(basics), ...prefs });
            toast.success("Profile saved — recommendations updated");
          }}
        >
          Save changes
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-5 p-6">
          <h2 className="font-semibold">Resume</h2>
          <ResumeUpload fileName={s.profile.resumeName} onChange={(resumeName) => s.setProfile({ resumeName })} />
          <h2 className="border-t pt-5 font-semibold">Profile</h2>
          <BasicsFields draft={basics} onChange={setBasics} errors={errors} />
        </Card>
        <Card className="space-y-5 p-6">
          <h2 className="font-semibold">Career preferences</h2>
          <PreferenceFields draft={prefs} onChange={setPrefs} />
        </Card>
      </div>
    </AppShell>
  );
}
