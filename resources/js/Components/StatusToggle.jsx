import { useForm } from "@inertiajs/react";
import { useEffect, useRef } from "react";

export default function StatusToggle({checked, action = false, tooltip = '', className = '', ...props}) {
    const subRef = useRef(null);
    const {
        data,
        setData,
        post,
        processing,
        reset,
        errors,
    } = useForm({
        status: checked,
    });

    const handleChange = (e) => {
        let status = e.target.checked;
        setData('status', status);
        if(action) {
            setTimeout(() => {
                subRef.current.click();
            },100);
        }
    }
     const handleUpdate = (e) => {
        e.preventDefault();
        if(action){
            post(action, {
                preserveScroll: true
            });
        }
     }

    useEffect(() => {
    },[errors])

    return (
        <form onSubmit={handleUpdate} className="flex">
            <label className={'inline-flex items-center mb-5 cursor-pointer '+className} {...props}>
                <input type="checkbox" value="1" className="sr-only peer" onChange={(e) => {handleChange(e)}} checked={data.status} readOnly={processing}/>
                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-0 dark:peer-focus:ring-0 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[#008F70]"></div>
            </label>
            <button type="submit" className="hidden" ref={subRef}>save</button>
        </form>
    )
}
