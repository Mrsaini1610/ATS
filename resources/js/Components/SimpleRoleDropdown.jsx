// RoleDropdown.jsx
import React, { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import { useHelpers } from "./Helpers";
import { TiInfoOutline } from "react-icons/ti";
import Tooltip from "./Tooltip";
import { initTooltips } from "flowbite";

export default function SimpleRoleDropdown({
    id,
    label = "Select Role *",
    name = "role",
    required = false,
    className = "",
    setData,
    error,
}) {
    const { toSlug } = useHelpers();
    const user = usePage().props.auth.user;
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        if (user?.branch_id) {
            axios
                .get(route("common.get.designation.users.type", { branch_id: user.branch_id }))
                .then((resp) => {
                    setRoles(resp?.data || []);
                })
                .catch((err) => {
                    console.error("Failed to fetch roles:", err);
                });
        }
    }, [user?.branch_id]);

    const handleChange = (e) => {
        setData(name, e.target.value);
    };

    useEffect(() => {
        initTooltips();
    });

    return (
        <div className={`w-full ${className}`}>
            <div className="flex gap-1">
                {label && <InputLabel htmlFor={id || name} value={label} />}
                <div data-tooltip-target={`tooltip-card-create-${id}`}>
                    <TiInfoOutline className="w-4 h-4 text-red-400" />
                </div>
                <Tooltip targetEl={`tooltip-card-create-${id}`} title="Add Only Selected Role Related Users In CVS File" />
            </div>
            <select
                id={id || name}
                name={name}
                onChange={handleChange}
                required={required}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-0"
            >
                <option value="">-Select Role-</option>
                {roles.map((role) => (
                    <option key={role.id} value={toSlug(role.name)}>
                        {role.name.split("-")[0]}
                    </option>
                ))}
            </select>
            {error && <InputError className="mt-2" message={error} />}
        </div>
    );
}
