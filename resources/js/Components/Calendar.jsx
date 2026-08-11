import React, { useState, useEffect } from "react";

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

// Static holiday data
const staticHolidays = [
    {
        id: 1,
        date: "2024-01-01",
        name: "New Year's Day",
        description: "Public Holiday",
        status: "active"
    },
    {
        id: 2,
        date: "2024-01-26",
        name: "Republic Day",
        description: "National Holiday",
        status: "active"
    },
    {
        id: 3,
        date: "2024-12-25",
        name: "Christmas Day",
        description: "Public Holiday",
        status: "active"
    }
];

// Static reminder data
const staticReminders = [
    {
        id: 1,
        date: "2024-01-15",
        title: "Team Meeting",
        description: "Quarterly team review meeting",
        reminder_days: 1,
        reminder_type: "before",
        status: "active"
    },
    {
        id: 2,
        date: "2024-01-20",
        title: "Project Deadline",
        description: "Final submission for client project",
        reminder_days: 3,
        reminder_type: "before",
        status: "active"
    },
    {
        id: 3,
        date: "2024-01-25",
        title: "Birthday Party",
        description: "John's birthday celebration",
        reminder_days: 0,
        reminder_type: "before",
        status: "active"
    },
    {
        id: 4,
        date: "2024-02-01",
        title: "Invoice Due",
        description: "Send monthly invoices to clients",
        reminder_days: 2,
        reminder_type: "after",
        status: "active"
    }
];

export default function Calendar() {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [holidays, setHolidays] = useState(staticHolidays);
    const [filteredHolidays, setFilteredHolidays] = useState(staticHolidays);
    const [filterDate, setFilterDate] = useState("");
    const [formData, setFormData] = useState({
        date: "",
        name: "",
        description: "",
    });
    const [reminderFormData, setReminderFormData] = useState({
        date: "",
        title: "",
        description: "",
        reminder_days: 0,
        reminder_type: "before",
    });
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [editingReminder, setEditingReminder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reminders, setReminders] = useState(staticReminders);
    const [filteredReminders, setFilteredReminders] = useState(staticReminders);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayIndex = firstDay == 0 ? 6 : firstDay - 1;

    const formatDateKey = (year, month, day) => {
        return `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day
        ).padStart(2, "0")}`;
    };

    const createDateString = (year, month, day) => {
        const date = new Date(year, month, day);
        const localYear = date.getFullYear();
        const localMonth = String(date.getMonth() + 1).padStart(2, "0");
        const localDay = String(date.getDate()).padStart(2, "0");
        return `${localYear}-${localMonth}-${localDay}`;
    };

    // Get reminders for current month
    const getRemindersForCurrentMonth = () => {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const formattedFirstDay = firstDayOfMonth.toISOString().split('T')[0];
        const formattedLastDay = lastDayOfMonth.toISOString().split('T')[0];

        const currentMonthReminders = staticReminders.filter(reminder => {
            return reminder.date >= formattedFirstDay && reminder.date <= formattedLastDay;
        });

        setReminders(currentMonthReminders);
    };

    // Get holidays for current month
    const getHolidaysForCurrentMonth = () => {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const formattedFirstDay = firstDayOfMonth.toISOString().split('T')[0];
        const formattedLastDay = lastDayOfMonth.toISOString().split('T')[0];

        const currentMonthHolidays = staticHolidays.filter(holiday => {
            return holiday.date >= formattedFirstDay && holiday.date <= formattedLastDay;
        });

        setHolidays(currentMonthHolidays);
    };

    useEffect(() => {
        getHolidaysForCurrentMonth();
        getRemindersForCurrentMonth();
    }, [year, month]);

    useEffect(() => {
        filterHolidaysByDate(filterDate);
        filterRemindersByDate(filterDate);
    }, [filterDate, holidays, reminders]);

    // Filter holidays by date
    const filterHolidaysByDate = (date) => {
        if (!date) {
            setFilteredHolidays(holidays);
            return;
        }

        const filtered = holidays.filter(holiday =>
            holiday.date == date
        );
        setFilteredHolidays(filtered);
    };

    // Filter reminders by date
    const filterRemindersByDate = (date) => {
        if (!date) {
            setFilteredReminders(reminders);
            return;
        }

        const filtered = reminders.filter(reminder =>
            reminder.date == date
        );
        setFilteredReminders(filtered);
    };

    const handlePrev = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNext = () => setCurrentDate(new Date(year, month + 1, 1));
    const handleToday = () =>
        setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

    const handleDateClick = (day) => {
        const dateString = createDateString(year, month, day);
        setSelectedDate(new Date(year, month, day));
        setFormData({
            date: dateString,
            name: "",
            description: "",
        });
        setReminderFormData({
            date: dateString,
            title: "",
            description: "",
            reminder_days: 0,
            reminder_type: "before",
        });
        setEditingHoliday(null);
        setEditingReminder(null);
        setShowModal(false);
        setShowReminderModal(false);

        // Automatically filter holidays and reminders for the clicked date
        setFilterDate(dateString);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // If the date input in the form changes, update the filter too
        if (name == 'date' && value) {
            setFilterDate(value);
        }
    };

    const handleReminderInputChange = (e) => {
        const { name, value } = e.target;
        setReminderFormData((prev) => ({
            ...prev,
            [name]: name === 'reminder_days' ? parseInt(value) || 0 : value,
        }));

        // If the date input in the form changes, update the filter too
        if (name == 'date' && value) {
            setFilterDate(value);
        }
    };

    const handleFilterDateChange = (e) => {
        setFilterDate(e.target.value);
    };

    const handleClearFilter = () => {
        setFilterDate("");
    };

    const handleAddHoliday = (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingHoliday) {
                // Update existing holiday
                const updatedHolidays = holidays.map(holiday =>
                    holiday.id === editingHoliday.id
                        ? { ...formData, id: editingHoliday.id, status: holiday.status }
                        : holiday
                );
                setHolidays(updatedHolidays);
                setFilteredHolidays(updatedHolidays.filter(holiday =>
                    !filterDate || holiday.date === filterDate
                ));
            } else {
                // Create new holiday
                const newHoliday = {
                    ...formData,
                    id: Date.now(), // Simple ID generation
                    status: 'active'
                };
                const updatedHolidays = [...holidays, newHoliday];
                setHolidays(updatedHolidays);
                setFilteredHolidays(updatedHolidays.filter(holiday =>
                    !filterDate || holiday.date === filterDate
                ));
            }

            // Keep the filter applied to the current date after adding holiday
            if (formData.date) {
                setFilterDate(formData.date);
            }

            setShowModal(false);
            setFormData({ date: "", name: "", description: "" });
            setEditingHoliday(null);

            // Show success message
            alert(editingHoliday ? "Holiday updated successfully!" : "Holiday added successfully!");

        } catch (error) {
            console.error("Error saving holiday:", error);
            alert("Error saving holiday. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddReminder = (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingReminder) {
                // Update existing reminder
                const updatedReminders = reminders.map(reminder =>
                    reminder.id === editingReminder.id
                        ? { ...reminderFormData, id: editingReminder.id, status: reminder.status }
                        : reminder
                );
                setReminders(updatedReminders);
                setFilteredReminders(updatedReminders.filter(reminder =>
                    !filterDate || reminder.date === filterDate
                ));
            } else {
                // Create new reminder
                const newReminder = {
                    ...reminderFormData,
                    id: Date.now(), // Simple ID generation
                    status: 'active'
                };
                const updatedReminders = [...reminders, newReminder];
                setReminders(updatedReminders);
                setFilteredReminders(updatedReminders.filter(reminder =>
                    !filterDate || reminder.date === filterDate
                ));
            }

            // Keep the filter applied to the current date after adding reminder
            if (reminderFormData.date) {
                setFilterDate(reminderFormData.date);
            }

            setShowReminderModal(false);
            setReminderFormData({
                date: "",
                title: "",
                description: "",
                reminder_days: 0,
                reminder_type: "before"
            });
            setEditingReminder(null);

            // Show success message
            alert(editingReminder ? "Reminder updated successfully!" : "Reminder added successfully!");

        } catch (error) {
            console.error("Error saving reminder:", error);
            alert("Error saving reminder. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditHoliday = (holiday) => {
        setFormData({
            date: holiday.date,
            name: holiday.name,
            description: holiday.description || "",
        });
        setEditingHoliday(holiday);
        setShowModal(true);

        // Automatically filter to show holidays for the edited holiday's date
        setFilterDate(holiday.date);
    };

    const handleEditReminder = (reminder) => {
        setReminderFormData({
            date: reminder.date,
            title: reminder.title,
            description: reminder.description || "",
            reminder_days: reminder.reminder_days || 0,
            reminder_type: reminder.reminder_type || "before",
        });
        setEditingReminder(reminder);
        setShowReminderModal(true);

        // Automatically filter to show reminders for the edited reminder's date
        setFilterDate(reminder.date);
    };

    const handleStatusChange = (holidayId, newStatus) => {
        const updatedHolidays = holidays.map(holiday =>
            holiday.id === holidayId
                ? { ...holiday, status: newStatus }
                : holiday
        );
        setHolidays(updatedHolidays);
        setFilteredHolidays(updatedHolidays.filter(holiday =>
            !filterDate || holiday.date === filterDate
        ));
        alert("Holiday status updated successfully!");
    };

    const handleReminderStatusChange = (reminderId, newStatus) => {
        const updatedReminders = reminders.map(reminder =>
            reminder.id === reminderId
                ? { ...reminder, status: newStatus }
                : reminder
        );
        setReminders(updatedReminders);
        setFilteredReminders(updatedReminders.filter(reminder =>
            !filterDate || reminder.date === filterDate
        ));
        alert("Reminder status updated successfully!");
    };

    const handleDeleteHoliday = (id) => {
        if (!confirm("Are you sure you want to delete this holiday?")) return;

        const updatedHolidays = holidays.filter(holiday => holiday.id !== id);
        setHolidays(updatedHolidays);
        setFilteredHolidays(updatedHolidays.filter(holiday =>
            !filterDate || holiday.date === filterDate
        ));
        alert("Holiday deleted successfully!");
    };

    const handleDeleteReminder = (id) => {
        if (!confirm("Are you sure you want to delete this reminder?")) return;

        const updatedReminders = reminders.filter(reminder => reminder.id !== id);
        setReminders(updatedReminders);
        setFilteredReminders(updatedReminders.filter(reminder =>
            !filterDate || reminder.date === filterDate
        ));
        alert("Reminder deleted successfully!");
    };

    const getHolidaysForDate = (dateKey) => {
        return holidays.filter((holiday) => holiday.date == dateKey);
    };

    const getRemindersForDate = (dateKey) => {
        return reminders.filter((reminder) => reminder.date == dateKey);
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'inactive':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const calculateReminderDate = (date, days, type) => {
        const reminderDate = new Date(date);
        if (type === 'before') {
            reminderDate.setDate(reminderDate.getDate() - days);
        } else {
            reminderDate.setDate(reminderDate.getDate() + days);
        }
        return reminderDate.toISOString().split('T')[0];
    };

    return (
        <div className="flex">
            <div className="w-full cards border borderbx rounded-lg p-4 shadow-sm mb-6">
                <div className="w-full bg-white">
                    <div className="flex flex-wrap lg:flex-nowrap gap-[8px] justify-between items-center mb-4 border-b-[1px] border-b-[#f2f2f2] pb-[25px]">
                        <div className="flex items-center gap-2 text-sm text-[#595959]">
                            <div className="w-[13px] h-[13px] bg-[#ccc] rounded-[50px]"></div>
                            2:30:20 - 9:00:00
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#595959]">
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrev}
                                    className="px-[10px] md:px-[25px] py-[5px] md:py-[10px] border rounded-[40px] text-[15px] text-[#595959]"
                                >
                                    Back
                                </button>
                                <div className="min-w-[120px] flex items-center justify-center gap-[10px] font-semibold text-[800] text-[15px] text-[#1E1E1E]">
                                    {months[month]} {year}
                                </div>
                                <button
                                    onClick={handleNext}
                                    className="px-[10px] md:px-[25px] py-[5px] md:py-[10px] border rounded-[40px] text-[15px] text-[#595959]"
                                >
                                    Next
                                </button>
                            </div>
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
                        <div className="w-[800px] md:w-full grid grid-cols-7 gap-[0] text-sm">
                            {[...Array(startDayIndex)].map((_, i) => (
                                <div
                                    key={`empty-${i}`}
                                    className="h-[150px] border p-[15px] m-[-1px]"
                                ></div>
                            ))}
                            {[...Array(daysInMonth)].map((_, i) => {
                                const day = i + 1;
                                const dateKey = formatDateKey(year, month, day);
                                const dateHolidays = getHolidaysForDate(dateKey);
                                const dateReminders = getRemindersForDate(dateKey);

                                const holidayColorSchemes = [
                                    'bg-blue-50 text-blue-700 border border-blue-200',
                                    'bg-green-50 text-green-700 border border-green-200',
                                    'bg-purple-50 text-purple-700 border border-purple-200',
                                    'bg-orange-50 text-orange-700 border border-orange-200',
                                ];

                                const reminderColorSchemes = [
                                    'bg-yellow-50 text-yellow-700 border border-yellow-200',
                                    'bg-indigo-50 text-indigo-700 border border-indigo-200',
                                    'bg-pink-50 text-pink-700 border border-pink-200',
                                    'bg-teal-50 text-teal-700 border border-teal-200',
                                ];

                                return (
                                    <div
                                        key={day}
                                        onClick={() => handleDateClick(day)}
                                        className="h-[150px] border p-[20px] m-[-1px] text-left cursor-pointer hover:bg-[#f9f9f9]"
                                    >
                                        <div className="font-semibold text-[15px] text-[#000]">
                                            {day}
                                        </div>
                                        {/* Display Holidays */}
                                        {dateHolidays.map((holiday, idx) => (
                                            <div
                                                key={`holiday-${holiday.id}`}
                                                className={`mt-1 px-2 py-1 text-xs rounded-full text-center font-medium ${
                                                    holidayColorSchemes[idx % holidayColorSchemes.length]
                                                }`}
                                            >
                                                🎉 {holiday.name}
                                            </div>
                                        ))}
                                        {/* Display Reminders */}
                                        {dateReminders.map((reminder, idx) => (
                                            <div
                                                key={`reminder-${reminder.id}`}
                                                className={`mt-1 px-2 py-1 text-xs rounded-full text-center font-medium ${
                                                    reminderColorSchemes[idx % reminderColorSchemes.length]
                                                }`}
                                            >
                                                ⏰ {reminder.title}
                                                {reminder.reminder_days > 0 && (
                                                    <span className="text-xs ml-1">
                                                        ({reminder.reminder_days} days {reminder.reminder_type})
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                            Add Holiday
                        </button>
                        <button
                            onClick={() => setShowReminderModal(true)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                            Add Reminder
                        </button>
                    </div>
                </div>
            </div>

            {/* Holiday Modal */}
            <div
                className={`fixed rounded-[8px] right-[10px] top-[110px] w-full max-w-[300px] bg-white z-[999] overflow-hidden overflow-y-auto max-h-[88vh] p-[20px] shadow mb-6 transition-all duration-500 ease-in-out transform
          ${
              showModal
                  ? "translate-x-0 opacity-100 min-w-[300px] md:min-w-[400px]"
                  : "translate-x-full opacity-0 min-w-0"
          }
          ms-4`}
            >
                <button
                    className="absolute top-[4px] right-[4px] w-[36px] h-[36px] bg-white shadow rounded-[50px]"
                    onClick={() => {
                        setShowModal(false);
                        setEditingHoliday(null);
                        setFormData({ date: "", name: "", description: "" });
                    }}
                >
                    ✕
                </button>

                <div className="flex flex-col gap-[10px] cards border borderbx rounded-lg p-4 shadow-sm">
                    <div className="pb-[10px] mb-[10px] border-b-[1px] border-b-[#f2f2f2] text-[18px] text-[#151547]">
                        {editingHoliday ? "Edit Holiday" : "Add Holiday"}
                    </div>

                    <form onSubmit={handleAddHoliday}>
                        <div className="flex flex-col gap-[8px] mb-[10px]">
                            <label className="text-[#727272] text-[14px] uppercase">
                                Select Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                className="px-[15px] py-[10px] border-[#f2f2f2] border-[1px] rounded-[5px] text-[#727272] text-[14px] outline-none"
                                required
                            />
                            {formData.date && (
                                <div className="text-xs text-gray-500">
                                    Selected:{" "}
                                    {new Date(formData.date).toLocaleDateString(
                                        "en-GB"
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-[8px] mb-[10px]">
                            <label className="text-[#727272] text-[14px] uppercase">
                                Holiday Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter holiday name"
                                className="px-[15px] py-[10px] border-[#f2f2f2] border-[1px] rounded-[5px] text-[#727272] text-[14px] outline-none"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-[8px] mb-[10px]">
                            <label className="text-[#727272] text-[14px] uppercase">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter holiday description"
                                className="px-[15px] py-[10px] border-[#f2f2f2] border-[1px] rounded-[5px] text-[#727272] text-[14px] outline-none resize-none"
                                rows="3"
                            />
                        </div>

                        <div className="flex justify-center gap-2 mt-4">
                            <button
                                type="button"
                                className="bg-[#0000001A] px-[30px] py-[8px] text-[16px] text-[#727272] rounded-[10px] border-[1px] border-[#0000001A]"
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingHoliday(null);
                                    setFormData({ date: "", name: "", description: "" });
                                }}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-[#5146E6] px-[30px] py-[8px] text-[16px] text-[#FFFFFF] rounded-[10px] border-[1px] border-[#5146E6] disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading
                                    ? (editingHoliday ? "Updating..." : "Adding...")
                                    : (editingHoliday ? "Update Holiday" : "Add Holiday")
                                }
                            </button>
                        </div>
                    </form>
                </div>

                <div className="flex flex-col gap-[10px] mt-[30px] cards border borderbx rounded-lg p-4 shadow-sm">
                    <div className="pb-[10px] mb-[10px] border-b-[1px] border-b-[#f2f2f2] text-[18px] text-[#151547]">
                        Holidays List
                    </div>

                    {/* Filter Section */}
                    <div className="mb-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[#727272] text-[14px] uppercase">
                                Filter by Date
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={handleFilterDateChange}
                                    className="flex-1 px-[15px] py-[10px] border-[#f2f2f2] border-[1px] rounded-[5px] text-[#727272] text-[14px] outline-none"
                                />
                                <button
                                    onClick={handleClearFilter}
                                    className="bg-[#0000001A] px-4 py-2 text-[14px] text-[#727272] rounded-[5px] border-[1px] border-[#0000001A]"
                                >
                                    Clear
                                </button>
                            </div>
                            {filterDate && (
                                <div className="text-xs text-gray-500">
                                    Showing holidays for: {new Date(filterDate).toLocaleDateString("en-GB")}
                                    {filteredHolidays.length > 0 && ` (${filteredHolidays.length} found)`}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-separate">
                            <thead>
                                <tr>
                                    <th className="bg-[#5146E64D] px-[8px] py-[12px] text-[#727272] text-[12px] text-left">
                                        S. No.
                                    </th>
                                    <th className="bg-[#5146E64D] px-[8px] py-[12px] text-[#727272] text-[12px] text-left">
                                        Date
                                    </th>
                                    <th className="bg-[#5146E64D] px-[8px] py-[12px] text-[#727272] text-[12px] text-left">
                                        Name
                                    </th>
                                    <th className="bg-[#5146E64D] px-[8px] py-[12px] text-[#727272] text-[12px] text-left">
                                        Description
                                    </th>
                                    <th className="bg-[#5146E64D] px-[8px] py-[12px] text-[#727272] text-[12px] text-left">
                                        Status
                                    </th>
                                    <th className="bg-[#5146E64D] px-[8px] py-[12px] text-[#727272] text-[12px] text-left">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHolidays.map((holiday, index) => (
                                    <tr key={holiday.id}>
                                        <td className="px-[8px] py-[12px] text-[14px] text-[#727272] text-left">
                                            {index + 1}
                                        </td>
                                        <td className="px-[8px] py-[12px] text-[14px] text-[#727272] text-left">
                                            {new Date(
                                                holiday.date
                                            ).toLocaleDateString("en-GB")}
                                        </td>
                                        <td className="px-[8px] py-[12px] text-[14px] text-[#727272] text-left">
                                            {holiday.name}
                                        </td>
                                        <td className="px-[8px] py-[12px] text-[14px] text-[#727272] text-left">
                                            {holiday.description || "-"}
                                        </td>
                                        <td className="px-[8px] py-[12px] text-[14px] text-[#727272] text-left">
                                            <select
                                                value={holiday.status || 'active'}
                                                onChange={(e) => handleStatusChange(holiday.id, e.target.value)}
                                                className={`px-2 py-1 text-xs rounded border ${getStatusBadgeClass(holiday.status)}`}
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-[8px] py-[12px] text-[14px] text-[#727272] text-left">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditHoliday(holiday)}
                                                    className="text-blue-500 hover:text-blue-700 text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteHoliday(holiday.id)}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredHolidays.length == 0 && (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-[8px] py-[12px] text-[14px] text-[#727272] text-center"
                                        >
                                            {filterDate ? `No holidays found for ${new Date(filterDate).toLocaleDateString("en-GB")}` : "No holidays found"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Reminder Modal */}
            <div
                className={`fixed rounded-[8px] right-[10px] top-[110px] w-full max-w-[300px] bg-white z-[1000] overflow-hidden overflow-y-auto max-h-[88vh] p-[20px] shadow mb-6 transition-all duration-500 ease-in-out transform
          ${
              showReminderModal
                  ? "translate-x-0 opacity-100 min-w-[300px] md:min-w-[400px]"
                  : "translate-x-full opacity-0 min-w-0"
          }
          ms-4`}
            >
                <button
                    className="absolute top-[4px] right-[4px] w-[36px] h-[36px] bg-white shadow rounded-[50px]"
                    onClick={() => {
                        setShowReminderModal(false);
                        setEditingReminder(null);
                        setReminderFormData({
                            date: "",
                            title: "",
                            description: "",
                            reminder_days: 0,
                            reminder_type: "before"
                        });
                    }}
                >
                    ✕
                </button>

                <div className="flex flex-col gap-[10px] cards border borderbx rounded-lg p-4 shadow-sm">
                    <div className="pb-[10px] mb-[10px] border-b-[1px] border-b-[#f2f2f2] text-[18px] text-[#151547]">
                        {editingReminder ? "Edit Reminder" : "Add Reminder"}
                    </div>

                    <form onSubmit={handleAddReminder}>
                        <div className="flex flex-col gap-[8px] mb-[10px]">
                            <label className="text-[#727272] text-[14px] uppercase">
                                Event Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={reminderFormData.date}
                                onChange={handleReminderInputChange}
                                className="px-[15px] py-[10px] border-[#f2f2f2] border-[1px] rounded-[5px] text-[#727272] text-[14px] outline-none"
                                required
                            />
                            {reminderFormData.date && (
                                <div className="text-xs text-gray-500">
                                    Event Date:{" "}
                                    {new Date(reminderFormData.date).toLocaleDateString(
                                        "en-GB"
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-[8px] mb-[10px]">
                            <label className="text-[#727272] text-[14px] uppercase">
                                Reminder Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={reminderFormData.title}
                                onChange={handleReminderInputChange}
                                placeholder="Enter reminder title"
                                className="px-[15px] py-[10px] border-[#f2f2f2] border-[1px] rounded-[5px] text-[#727272] text-[14px] outline-none"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-[8px] mb-[10px]">
                            <label className="text-[#727272] text-[14px] uppercase">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={reminderFormData.description}
                                onChange={handleReminderInputChange}
                                placeholder="Enter reminder description"
                                className="px-[15px] py-[10px] border-[#f2f2f2] border-[1px] rounded-[5px] text-[#727272] text-[14px] outline-none resize-none"
                                rows="3"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-[10px]">
                            <div className="flex flex-col gap-[8px]">
                                <label className="text-[#727272] text-[14px] uppercase">
                                    Remind Before/After
                                </label>
                                <select
                                    name="reminder_type"
                                    value={reminderFormData.reminder_type}
                                    onChange={handleReminderInputChange}
                                    className="px-[15px] py-[10px] border-[#f2f2f2] border-[1px] rounded-[5px] text-[#727272] text-[14px] outline-none"
                                >
                                    <option value="before">Before</option>
                                    <option value="after">After</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-[8px]">
                                <label className="text-[#727272] text-[14px] uppercase">
                                    Days
                                </label>
                                <input
                                    type="number"
                                    name="reminder_days"
                                    value={reminderFormData.reminder_days}
                                    onChange={handleReminderInputChange}
                                    placeholder="0"
                                    min="0"
                                    className="px-[15px] py-[10px] border-[#f2f2f2] border-[1px] rounded-[5px] text-[#727272] text-[14px] outline-none"
                                />
                            </div>
                        </div>

                        {reminderFormData.date && reminderFormData.reminder_days > 0 && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-600">
                                    <strong>Reminder Calculation:</strong><br />
                                    Event Date: {new Date(reminderFormData.date).toLocaleDateString("en-GB")}<br />
                                    Reminder {reminderFormData.reminder_type} {reminderFormData.reminder_days} day(s)<br />
                                    <strong>Reminder Date: {calculateReminderDate(
                                        reminderFormData.date,
                                        reminderFormData.reminder_days,
                                        reminderFormData.reminder_type
                                    )}</strong>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center gap-2 mt-4">
                            <button
                                type="button"
                                className="bg-[#0000001A] px-[30px] py-[8px] text-[16px] text-[#727272] rounded-[10px] border-[1px] border-[#0000001A]"
                                onClick={() => {
                                    setShowReminderModal(false);
                                    setEditingReminder(null);
                                    setReminderFormData({
                                        date: "",
                                        title: "",
                                        description: "",
                                        reminder_days: 0,
                                        reminder_type: "before"
                                    });
                                }}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-[#F59E0B] px-[30px] py-[8px] text-[16px] text-[#FFFFFF] rounded-[10px] border-[1px] border-[#F59E0B] disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading
                                    ? (editingReminder ? "Updating..." : "Adding...")
                                    : (editingReminder ? "Update Reminder" : "Add Reminder")
                                }
                            </button>
                        </div>
                    </form>
                </div>

                <div className="flex flex-col gap-[10px] mt-[30px] cards border borderbx rounded-lg p-4 shadow-sm">
                    <div className="pb-[10px] mb-[10px] border-b-[1px] border-b-[#f2f2f2] text-[18px] text-[#151547]">
                        Reminders List
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-separate">
                            <thead>
                                <tr>
                                    <th className="bg-[#F59E0B4D] px-[8px] py-[12px] text-[#727272] text-[12px] text-left">
                                        S. No.
                                    </th>
                                    <th className="bg-[#F59E0B4D] px-[8px] py-[12px] text-[#727272] text-[12px] text-left">
                                        Event Date
                                    </th>
                                    <th className="bg-[#F59E0B4D] px-[8px] py-[12px] text-[#727272] text-[12px] text-left">
                                        Title
                                    </th>
                                    <th className="bg-[#F59E0B4D] px-[8px] py-[12px] text-[#727272] text-[12px] text-left">
                                        Reminder
                                    </th>
                                    <th className="bg-[#F59E0B4D] px-[8px] py-[12px] text-[#727272] text-[12px] text-left">
                                        Description
                                    </th>
                                    <th className="bg-[#F59E0B4D] px-[8px] py-[12px] text-[#727272] text-[12px] text-left">
                                        Status
                                    </th>
                                    <th className="bg-[#F59E0B4D] px-[8px] py-[12px] text-[#727272] text-[12px] text-left">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReminders.map((reminder, index) => (
                                    <tr key={reminder.id}>
                                        <td className="px-[8px] py-[12px] text-[14px] text-[#727272] text-left">
                                            {index + 1}
                                        </td>
                                        <td className="px-[8px] py-[12px] text-[14px] text-[#727272] text-left">
                                            {new Date(
                                                reminder.date
                                            ).toLocaleDateString("en-GB")}
                                        </td>
                                        <td className="px-[8px] py-[12px] text-[14px] text-[#727272] text-left">
                                            {reminder.title}
                                        </td>
                                        <td className="px-[8px] py-[12px] text-[14px] text-[#727272] text-left">
                                            {reminder.reminder_days > 0 ? (
                                                <span>
                                                    {reminder.reminder_days} day(s) {reminder.reminder_type}
                                                    <br />
                                                    <small className="text-xs text-gray-500">
                                                        Reminder: {calculateReminderDate(
                                                            reminder.date,
                                                            reminder.reminder_days,
                                                            reminder.reminder_type
                                                        )}
                                                    </small>
                                                </span>
                                            ) : (
                                                "Same day"
                                            )}
                                        </td>
                                        <td className="px-[8px] py-[12px] text-[14px] text-[#727272] text-left">
                                            {reminder.description || "-"}
                                        </td>
                                        <td className="px-[8px] py-[12px] text-[14px] text-[#727272] text-left">
                                            <select
                                                value={reminder.status || 'active'}
                                                onChange={(e) => handleReminderStatusChange(reminder.id, e.target.value)}
                                                className={`px-2 py-1 text-xs rounded border ${getStatusBadgeClass(reminder.status)}`}
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-[8px] py-[12px] text-[14px] text-[#727272] text-left">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditReminder(reminder)}
                                                    className="text-blue-500 hover:text-blue-700 text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteReminder(reminder.id)}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredReminders.length == 0 && (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-[8px] py-[12px] text-[14px] text-[#727272] text-center"
                                        >
                                            {filterDate ? `No reminders found for ${new Date(filterDate).toLocaleDateString("en-GB")}` : "No reminders found"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
