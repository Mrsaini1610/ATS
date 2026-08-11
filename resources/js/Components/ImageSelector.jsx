import React, { useState } from 'react';
import { useAlerts } from './Alerts';

export default function ImageSelector({
    label = "Select Image",
    name,
    onChange,
    defaultImg = "/images/common/img_not_found.jpg"
}) {
    const [preview, setPreview] = useState(defaultImg);
    const {successAlert, errorAlert, errorsHandling} = useAlerts();


    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.match('image/jpeg|image/png')) {
            errorAlert("Invalid format. Only JPG and PNG allowed.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            // alert(`${file.name} - Size exceeds 5MB.`);
            errorAlert("Size exceeds 5MB.");
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        onChange(file, previewUrl); // Send back to parent
    };

    return (
        <div className="rounded-md border border-gray-400 bg-gray-50 shadow-md w-full p-2 mb-4 md:mb-0">
            <label htmlFor={name} className="flex flex-col items-center gap-2 cursor-pointer">
                <img src={preview} alt="Preview" className="h-auto md:h-20 object-cover w-full" />
            </label>
            <input
                id={name}
                name={name}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
            />
        </div>
    );
}
