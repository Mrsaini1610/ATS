// FileInput.jsx
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";

export default function FileInput({
    id,
    label,
    name,
    accept = "*",
    required = false,
    className = "",
    setData,
    error,
    maxSizeMB = 5, // default max 5MB
}) {
    const handleChange = (e) => {
        const file = e.target.files[0];

        if (file && file.size > maxSizeMB * 1024 * 1024) {
            alert(`File size exceeds ${maxSizeMB}MB`);
            e.target.value = "";
            return;
        }

        setData(name, file);
    };

    return (
        <div className={`w-full ${className}`}>
            {label && <InputLabel htmlFor={id || name} value={label} />}
            <input
                id={id || name}
                type="file"
                name={name}
                accept={accept}
                onChange={handleChange}
                required={required}
                className="mt-1 block w-full border-gray-400 rounded-md shadow-sm focus:ring-0 focus:border-gray-500 text-gray-900 dark:text-gray-200 dark:bg-gray-700"
            />
            {error && <InputError className="mt-2" message={error} />}
        </div>
    );
}
