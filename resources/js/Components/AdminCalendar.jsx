import React, { useState, useEffect, useMemo } from "react";
import { router, usePage } from "@inertiajs/react";
import CountdownTimer from "./CountdownTimer";
import ConfirmDialog from "./ConfirmDialog";
import DateDetailModal from "./DateDetailModal";
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function AdminCalendar() {
    const today = new Date();
    const { props } = usePage();
    const memberCheckIns = props?.memberCheckIns || {};
    const checkCheckoutToday = props?.checkCheckoutToday;
    const checkCheckoutList = props?.checkCheckoutList || [];
    const departmentMembers = props?.departmentMembers || [];

    const [currentDate, setCurrentDate] = useState(new Date());
    const [open, setOpen] = useState(false);
    const [showDateDetailModal, setShowDateDetailModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [checkInStatus, setCheckInStatus] = useState({
        checked_in: checkCheckoutToday?.check_in !== null && checkCheckoutToday !== null,
        checked_out: checkCheckoutToday?.check_out !== null && checkCheckoutToday !== null,
        check_in_time: checkCheckoutToday?.check_in || null,
        elapsed_time: 0,
        elapsed_time_formatted: "00:00:00",
    });

    const [timer, setTimer] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const checkInDataByDate = useMemo(() => {
    const dataByDate = {};
    Object.entries(memberCheckIns).forEach(([date, checkins]) => {
      const dateKey = date.split(" ")[0];
      if (Array.isArray(checkins)) {
        const uniqueMembers = new Set(checkins.map((c) => c.member_id));
        dataByDate[dateKey] = {
          checkins: checkins,
          count: uniqueMembers.size,
        };
      }
    });
    if (checkCheckoutList?.length > 0) {
      checkCheckoutList.forEach((checkin) => {
        const dateKey = checkin.date.split("T")[0];
        if (!dataByDate[dateKey]) {
          dataByDate[dateKey] = {
            checkins: [],
            count: 0,
          };
        }
        const exists = dataByDate[dateKey].checkins.some(
          (c) => c.id === checkin.id
        );
        if (!exists) {
          dataByDate[dateKey].checkins.push(checkin);
          const uniqueMembers = new Set(
            dataByDate[dateKey].checkins.map((c) => c.member_id)
          );
          dataByDate[dateKey].count = uniqueMembers.size;
        }
      });
    }
    return dataByDate;
  }, [checkCheckoutList, memberCheckIns]);
    const formatSecondsToTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };
    const formatMinutesToTime = (minutes) => {
        if (!minutes) return "N/A";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };
    useEffect(() => {
        if (checkCheckoutToday?.check_in && !checkCheckoutToday?.check_out) {
            const checkInTime = new Date(checkCheckoutToday.check_in);

            const calculateElapsedTime = () => {
                const currentTime = new Date();
                return Math.floor((currentTime - checkInTime) / 1000);
            };

            const initialElapsedTime = calculateElapsedTime();
            setCheckInStatus((prev) => ({
                ...prev,
                elapsed_time: initialElapsedTime,
                elapsed_time_formatted: formatSecondsToTime(initialElapsedTime),
            }));

            const timerInterval = setInterval(() => {
                setCheckInStatus((prev) => {
                    if (prev.checked_in && !prev.checked_out) {
                        const newElapsedTime = prev.elapsed_time + 1;
                        return {
                            ...prev,
                            elapsed_time: newElapsedTime,
                            elapsed_time_formatted:
                                formatSecondsToTime(newElapsedTime),
                        };
                    }
                    return prev;
                });
            }, 1000);

            setTimer(timerInterval);

            return () => clearInterval(timerInterval);
        }
    }, [checkCheckoutToday]);
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDayIndex = firstDay === 0 ? 6 : firstDay - 1;
        return { startDayIndex, daysInMonth };
    }, [year, month]);
    const confirmStatusChange = () => {
        if (confirmAction === "checkin") {
            performCheckIn();
        } else if (confirmAction === "checkout") {
            performCheckOut();
        }
        setShowConfirmDialog(false);
        setConfirmAction(null);
    };

    const performCheckIn = () => {
        router.post(route("admin.checkin"), {}, { preserveState: true });
        router.visit(route("admin.dashboard"));
    };
    const performCheckOut = () => {
        router.post(route("admin.checkout"), {}, { preserveState: true });
        router.visit(route("admin.dashboard"));
    };

    const handlePrev = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNext = () => setCurrentDate(new Date(year, month + 1, 1));
    const handleToday = () =>
        setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

 const handleDateClick = (day) => {
    const clickedDate = new Date(year, month, day);
    const formattedDate = [
        clickedDate.getFullYear(),
        String(clickedDate.getMonth() + 1).padStart(2, "0"),
        String(clickedDate.getDate()).padStart(2, "0"),
    ].join("-");
    setSelectedDate(formattedDate);
    setShowDateDetailModal(true);
};

    return (
        <div className="flex">
            <div className="w-full cards border borderbx rounded-lg p-4 shadow-sm mb-6 relative">
                <div className="flex flex-wrap lg:flex-nowrap gap-[8px] justify-between items-center mb-4 border-b-[1px] border-b-[#f2f2f2] pb-[25px]">
                    <div className="flex items-center gap-2 text-sm text-[#595959]">
                        <div className="w-[13px] h-[13px] bg-[#ccc] rounded-[50px]"></div>
                        <CountdownTimer
                            elapsedTimeFormatted={
                                checkInStatus.elapsed_time_formatted
                            }
                        />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-[#595959]">
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrev}
                                className="px-[10px] md:px-[25px] py-[5px] border rounded-[40px] text-[#595959]"
                            >
                                Back
                            </button>
                            <div className="min-w-[120px] flex items-center justify-center font-semibold text-[15px] text-[#1E1E1E]">
                                {months[month]} {year}
                            </div>
                            <button
                                onClick={handleNext}
                                className="px-[10px] md:px-[25px] py-[5px] border rounded-[40px] text-[#595959]"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-2 relative">
                        {!checkInStatus.checked_in ? (
                            <button
                                className="px-4 py-2 bg-[#E60000] text-[14px] text-white rounded-[50px]"
                                onClick={() => {
                                    setConfirmAction("checkin");
                                    setShowConfirmDialog(true);
                                }}
                            >
                                Check In
                            </button>
                        ) : !checkInStatus.checked_out ? (
                            <button
                                className="px-4 py-2 bg-[#61CC68] text-[14px] text-white rounded-[50px]"
                                onClick={() => setOpen(!open)}
                            >
                                Check Out
                            </button>
                        ) : (
                            <button
                                className="px-4 py-2 bg-gray-400 text-[14px] text-white rounded-[50px]"
                                disabled
                            >
                                Completed
                            </button>
                        )}
                        {open && (
                            <div className="absolute mt-[50px] right-0 w-72 bg-white border rounded-lg shadow-md p-4 z-50">
                                <div className="flex justify-between items-center mb-[10px] pb-[10px] border-b">
                                    <h3 className="text-[18px] font-[500] text-[#151547]">
                                        Check Out
                                    </h3>
                                    <button onClick={() => setOpen(false)}>
                                        ✕
                                    </button>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Worked Hours</span>
                                        <span>
                                            {
                                                checkInStatus.elapsed_time_formatted
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Expected Hours</span>
                                        <span>08:00:00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Pending Time</span>
                                        <span>01:20:00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Overtime</span>
                                        <span>+01:10:22</span>
                                    </div>
                                </div>
                                <div className="flex justify-center gap-2 mt-4">
                                    <button
                                        className="bg-[#0000001A] px-[30px] py-[8px] text-[#727272] rounded-[10px]"
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="bg-[#5146E6] px-[30px] py-[8px] text-white rounded-[10px]"
                                        onClick={() => {
                                            setConfirmAction("checkout");
                                            setShowConfirmDialog(true);
                                        }}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="overflow-hidden overflow-x-auto">
                    <div className="w-[800px] md:w-full grid grid-cols-7 text-center font-medium border-b pb-2">
                        <div>MON</div>
                        <div>TUE</div>
                        <div>WED</div>
                        <div>THU</div>
                        <div>FRI</div>
                        <div>SAT</div>
                        <div>SUN</div>
                    </div>
                    <div className="w-[800px] md:w-full grid grid-cols-7 text-sm">
                        {[...Array(calendarDays.startDayIndex)].map((_, i) => (
                            <div
                                key={`empty-${i}`}
                                className="h-[150px] border p-[15px] m-[-1px]"
                            ></div>
                        ))}
                        {[...Array(calendarDays.daysInMonth)].map((_, i) => {
        const day = i + 1;
        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayData = checkInDataByDate[dateKey] || { checkins: [], count: 0 };

        return (
            <div
                key={day}
                onClick={() => handleDateClick(day)}
                className="h-[150px] border p-[15px] m-[-1px] cursor-pointer hover:bg-[#f9f9f9] relative"
            >
                <div className="font-semibold">{day}</div>
             {dayData.count > 0 && (
    <div className="flex items-center gap-2">
        <span>Total Member Check in: </span>
        <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {dayData.count}
        </div>
    </div>
)}

                {dayData.checkins.length > 0 ? (
    dayData.checkins.map((checkin, idx) => (
        <div key={idx} className="mt-1 text-xs">
            {checkin?.member_id === props?.auth?.user?.id && (
                <>
                    <div className="text-[#5146E6]">
                        In: {checkin.check_in
                            ? new Date(checkin.check_in).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                            })
                            : "N/A"}
                    </div>
                    {checkin.check_out && (
                        <div className="text-[#34CC88]">
                            Out: {new Date(checkin.check_out).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    ))
) : (
    <div className="mt-1 text-xs text-gray-400">No check-ins</div>
)}

            </div>
        );
    })}
                    </div>
                </div>


    <DateDetailModal
                    isOpen={showDateDetailModal}
                    onClose={() => setShowDateDetailModal(false)}
                    selectedDate={selectedDate}
                />

                <ConfirmDialog
                    isOpen={showConfirmDialog}
                    onClose={() => setShowConfirmDialog(false)}
                    onConfirm={confirmStatusChange}
                    title="Confirm Action"
                    message={
                        confirmAction === "checkin"
                            ? "Are you sure you want to Check In?"
                            : "Are you sure you want to Check Out?"
                    }
                    confirmText="Confirm"
                    cancelText="Cancel"
                />
            </div>
        </div>
    );
}
