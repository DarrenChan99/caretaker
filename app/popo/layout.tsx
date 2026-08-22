import { ViewRoot } from "@/components/ViewRoot";
import { EntryGate } from "@/components/popo/EntryGate";
import { ReminderPopup } from "@/components/popo/ReminderPopup";
import { SettingsFab } from "@/components/popo/SettingsFab";
import { HomeFab } from "@/components/popo/HomeFab";

export default function PopoLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewRoot view="popo">
      <div className="relative mx-auto flex min-h-dvh max-w-[640px] flex-col">
        {/* Inside the gate: the reminder must not fire (or try to speak) before she
            has tapped in and unlocked audio. */}
        <EntryGate>
          {children}
          <ReminderPopup />
        </EntryGate>
        <HomeFab />
        <SettingsFab />
      </div>
    </ViewRoot>
  );
}
