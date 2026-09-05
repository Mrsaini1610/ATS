import React from "react";

export default function RepeatableSection({
    title,
    items,
    setItems,
    addLabel = "Add",
    emptyItem,
    children,
}) {
    const addRow = () => setItems([...(items || []), { ...emptyItem }]);
    const removeRow = (idx) =>
        setItems((items || []).filter((_, i) => i !== idx));

    return (
        <div className="tablebxbg p-[15px] rounded-[15px]">
            <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                    {title}
                </h3>
                <button
                    type="button"
                    onClick={addRow}
                    className="bg-[rgb(82_70_230)] hover:bg-[rgb(82_70_230)/0.9] text-white px-3 py-2 rounded-md text-sm"
                >
                    {addLabel}
                </button>
            </div>

            <div className="space-y-3">
                {(items || []).length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                        No entries added yet.
                    </div>
                ) : (
                    (items || []).map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white/60 dark:bg-[#0a0e25] border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                        >
                            <div className="flex justify-end mb-2">
                                <button
                                    type="button"
                                    onClick={() => removeRow(idx)}
                                    className="text-sm px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Remove
                                </button>
                            </div>
                            {children({ item, idx })}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

