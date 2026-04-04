import { salonTodayYMD } from "@/lib/business-schedule";
import { AttendanceEditor } from "@/app/admin/attendance/attendance-client";

export default function AdminAttendancePage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-white">Provider attendance</h1>
      <p className="mt-2 text-zinc-400">
        Mark who is out for a specific day. The booking calendar hides slots that only they could take.
      </p>
      <div className="mt-8">
        <AttendanceEditor initialDateYMD={salonTodayYMD()} />
      </div>
    </div>
  );
}
