// components/ImageInputPreview.jsx
import React, { useState } from 'react';

const ImageInputPreview = ({ id, label, required = false, setData, error }) => {
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            setData(id, file);
        }
    };

    return (
        <div className="flex flex-col">
            <label htmlFor={id} className="mb-1 font-medium text-gray-700 dark:text-gray-300">
                {label} {required && '*'}
            </label>

            <div className="flex items-start space-x-4">
                <input
                    type="file"
                    id={id}
                    required={required}
                    accept="image/*"
                    onChange={handleChange}
                    className="block w-full  border border-gray-500 rounded-md shadow-sm"
                />
                {previewUrl && (
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-16 h-16 rounded object-cover border border-gray-500"
                    />
                )}
            </div>

            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
    );
};

export default ImageInputPreview;
