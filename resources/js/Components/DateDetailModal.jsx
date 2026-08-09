// DateDetailModal.jsx
import React, { useState } from 'react';
import { usePage, router } from "@inertiajs/react";

const DateDetailModal = ({
    isOpen,
    onClose,
    selectedDate,
}) => {
    const [editingField, setEditingField] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const { props } = usePage();
    const { memberCheckIns = {} } = props;
    const dateObj = new Date(selectedDate);

    // Find the correct key in memberCheckIns that matches the selected date
    const formattedDate = Object.keys(memberCheckIns).find(key =>
        key.startsWith(selectedDate.split('T')[0])
    );

    // Get check-ins for the selected date
    const dateCheckIns = formattedDate && memberCheckIns[formattedDate]
        ? Object.values(memberCheckIns[formattedDate])
        : [];

    // Extract unique members from check-ins
    const members = [];
    const memberCheckInMap = {};

    dateCheckIns.forEach(checkin => {
        if (checkin && checkin.member_id && checkin.member) {
            memberCheckInMap[checkin.member_id] = checkin;
            // Add member to list if not already added
            if (!members.some(m => m.id === checkin.member_id)) {
                members.push(checkin.member);
            }
        }
    });

    // Helper function to format minutes to time
    const formatMinutesToTime = (minutes) => {
        if (!minutes) return "N/A";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    // Convert time string to 24-hour format for input
    const formatTimeForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Handle field click to start editing
    const handleFieldClick = (memberId, field, currentValue) => {
        setEditingField(`${memberId}-${field}`);
        setEditValues(prev => ({
            ...prev,
            [`${memberId}-${field}`]: formatTimeForInput(currentValue)
        }));
    };

    // Handle time input change
    const handleTimeChange = (memberId, field, value) => {
        setEditValues(prev => ({
            ...prev,
            [`${memberId}-${field}`]: value
        }));
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingField(null);
        setEditValues({});
    };

    // Update check-in/check-out time
    const handleUpdate = async (checkInId) => {
        if (!checkInId) return;

        const checkin = dateCheckIns.find(ci => ci.id === checkInId);
        if (!checkin) return;

        setLoading(true);

        try {
            // Prepare data for update
            const updateData = {
                check_in: checkin.check_in,
                check_out: checkin.check_out
            };

            // Apply edited values
            const checkInKey = `${checkin.member_id}-check_in`;
            const checkOutKey = `${checkin.member_id}-check_out`;

            if (editValues[checkInKey]) {
                const [hours, minutes] = editValues[checkInKey].split(':');
                const newDate = new Date(selectedDate);
                newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                updateData.check_in = newDate.toISOString();
            }

            if (editValues[checkOutKey]) {
                const [hours, minutes] = editValues[checkOutKey].split(':');
                const newDate = new Date(selectedDate);
                newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                updateData.check_out = newDate.toISOString();
            }
            router.post(`/admin/check-in-out/update/${checkInId}`, updateData, {
                onSuccess: () => {
                    setEditingField(null);
                    setEditValues({});
                    setLoading(false);
                },
                onError: () => {
                    setLoading(false);
                    alert('Error updating check-in/check-out times');
                }
            });

        } catch (error) {
            setLoading(false);
            console.error('Update error:', error);
        }
    };

    // Check if a field is being edited
    const isEditing = (memberId, field) => {
        return editingField === `${memberId}-${field}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-11/12 md:w-3/4 lg:w-2/3 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold">
                        Check-in/Check-out Details for {dateObj.toLocaleDateString()}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                        disabled={loading}
                    >
                        ✕
                    </button>
                </div>

                <div className="p-4">
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            Showing attendance for {members.length} members
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Click on check-in/check-out times to edit them
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border-collapse">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left border">Member Name</th>
                                    <th className="px-4 py-2 text-left border">Check-in Time</th>
                                    <th className="px-4 py-2 text-left border">Check-out Time</th>
                                    <th className="px-4 py-2 text-left border">Total Hours</th>
                                    <th className="px-4 py-2 text-left border">Status</th>
                                    <th className="px-4 py-2 text-left border">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map(member => {
                                    const checkin = memberCheckInMap[member.id];
                                    const hasCheckedIn = checkin && checkin.check_in;
                                    const hasCheckedOut = checkin && checkin.check_out;

                                    let status = "Not Checked In";
                                    let statusColor = "text-red-600";

                                    if (hasCheckedIn && hasCheckedOut) {
                                        status = "Completed";
                                        statusColor = "text-green-600";
                                    } else if (hasCheckedIn && !hasCheckedOut) {
                                        status = "Checked In";
                                        statusColor = "text-blue-600";
                                    }

                                    return (
                                        <tr key={member.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2 border">{member.name}</td>
                                            
                                            {/* Check-in Time */}
                                            <td className="px-4 py-2 border">
                                                {isEditing(member.id, 'check_in') ? (
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="time"
                                                            value={editValues[`${member.id}-check_in`] || ''}
                                                            onChange={(e) => handleTimeChange(member.id, 'check_in', e.target.value)}
                                                            className="border rounded px-2 py-1 text-sm"
                                                            step="60"
                                                        />
                                                        <button
                                                            onClick={cancelEditing}
                                                            className="text-xs text-gray-500 hover:text-gray-700"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => handleFieldClick(member.id, 'check_in', checkin?.check_in)}
                                                        className={`cursor-pointer hover:bg-gray-100 px-2 py-1 rounded ${
                                                            hasCheckedIn ? '' : 'text-gray-400'
                                                        }`}
                                                    >
                                                        {hasCheckedIn
                                                            ? new Date(checkin.check_in).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })
                                                            : 'N/A'
                                                        }
                                                    </div>
                                                )}
                                            </td>
                                            
                                            {/* Check-out Time */}
                                            <td className="px-4 py-2 border">
                                                {isEditing(member.id, 'check_out') ? (
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="time"
                                                            value={editValues[`${member.id}-check_out`] || ''}
                                                            onChange={(e) => handleTimeChange(member.id, 'check_out', e.target.value)}
                                                            className="border rounded px-2 py-1 text-sm"
                                                            step="60"
                                                        />
                                                        <button
                                                            onClick={cancelEditing}
                                                            className="text-xs text-gray-500 hover:text-gray-700"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => handleFieldClick(member.id, 'check_out', checkin?.check_out)}
                                                        className={`cursor-pointer hover:bg-gray-100 px-2 py-1 rounded ${
                                                            hasCheckedOut ? '' : 'text-gray-400'
                                                        }`}
                                                    >
                                                        {hasCheckedOut
                                                            ? new Date(checkin.check_out).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })
                                                            : 'N/A'
                                                        }
                                                    </div>
                                                )}
                                            </td>
                                            
                                            <td className="px-4 py-2 border">
                                                {checkin && checkin.total_minutes
                                                    ? formatMinutesToTime(checkin.total_minutes)
                                                    : 'N/A'
                                                }
                                            </td>
                                            <td className={`px-4 py-2 border font-medium ${statusColor}`}>
                                                {status}
                                            </td>
                                            <td className="px-4 py-2 border">
                                                {checkin && (isEditing(member.id, 'check_in') || isEditing(member.id, 'check_out')) ? (
                                                    <button
                                                        onClick={() => handleUpdate(checkin.id)}
                                                        disabled={loading}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 text-sm"
                                                    >
                                                        {loading ? 'Updating...' : 'Update'}
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">Click time to edit</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {members.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                            No check-in records found for this date.
                        </div>
                    )}
                </div>

                <div className="p-4 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:bg-gray-100"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DateDetailModal;