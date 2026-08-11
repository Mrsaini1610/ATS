import { toast } from "react-hot-toast";

export const useAlerts = () => {

    /**
     * Success Taost Alert
     * @param {String} message Alert Message
     * @param {String} position Position of Toast
     * @param {Number} duration MiliSeconds
     * @returns {void}
     */
    const successAlert = (message, position = "top-right", duration = 3000) => {
        toast.success(message, {
            duration: duration,
            position: position,
        });
        return;
    }


    /**
     * Error Taost Alert
     * @param {String} message Alert Message
     * @param {String} position Position of Toast
     * @param {Number} duration MiliSeconds
     * @returns {void}
     */
    const errorAlert = (message, position = "top-right", duration = 3000) => {
        toast.error(message, {
            duration: duration,
            position: position,
        });
        return;
    }

    /**
     * Warning Taost Alert
     * @param {String} message Alert Message
     * @param {String} position Position of Toast
     * @param {Number} duration MiliSeconds
     * @returns {void}
     */
    const warningAlert = (message, position = "top-right", duration = 3000) => {
        toast(message, {
            duration: duration,
            position: position,
            className: "bg-yellow-800 text-white"
        });
        return;
    }

    /**
     * Info Taost Alert
     * @param {String} message Alert Message
     * @param {String} position Position of Toast
     * @param {Number} duration MiliSeconds
     * @returns {void}
     */
    const infoAlert = (message, position = "top-right", duration = 3000) => {
        toast(message, {
            duration: duration,
            position: position,
        });
        return;
    }

    /**
     * HTTP Errors handling
     * @param {Object} error HTTP errors Object|Array
     * @param {String} position Position of Toast
     * @param {Number} duration Miliseconds time
     * @returns {void}
     */
    const errorsHandling = (error, position = "top-right", duration = 3000) => {
        {
            Object.keys(error).map((key) => {
                let e = error[key];
                return toast.error(e, {
                    duration: duration,
                    position: position
                });
            })
        }
        return;
    }

    return { successAlert, errorAlert, warningAlert, infoAlert, errorsHandling };

}
