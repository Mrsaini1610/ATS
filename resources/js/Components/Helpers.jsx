import { useAlerts } from './Alerts';

export const useHelpers = () => {
    const {successAlert, errorAlert} = useAlerts();

    /**
     * Format a Standard Date
     *
     * @param {String} d Date String
     * @param {String} f Date Format String as per ISO
     * @return {String}
     */
    const dateFormat = (d, f = 'DD-MM-YYYY') => {
        if(d == null || !d.length) {
            return '--/--/----';
        }
        if(moment(d).isValid()) {
            return moment(d).format(f);
        }
        return 'nn/nn/nnnn';
    }

    /**
     *
     * @param {String} txt Text String to remove space & urlencode characters
     * @param {String} replaceWith Character which will take place
     * @returns {String}
     */
    const generateUrlSearchString = (txt, replaceWith = '-') => {
        return txt.replace(/[^a-zA-Z0-9\-]+/g, '-');
    }

    /**
     * Copy Any Text
     *
     * @param {String} c Content to cop
     * @param {String} m Message to show on alert
     * @returns void
     */
    const copyContent = (c, m = 'Copied.') => {
        try {
            navigator.clipboard.writeText(c);
            successAlert(m);
        } catch(error){
            errorAlert(`Failed to copy: ${c}.`);
        }
    }


    /**
     * Make text bold where text is between two asterisks (*)
     *
     * @param {string} text - The text to format
     * @return {string} - Formatted text
     */
    const makeTextBoldWithStar =(text) => {
        return text.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
    }

    /**
     * Make text italic where text is between underscores (_)
     *
     * @param {string} text - The text to format
     * @return {string} - Formatted text
     */
    const makeTextItalicWithUnderscore = (text) => {
        return text.replace(/_(.*?)_/g, "<i>$1</i>");
    }


     /**
     * Convert a string to slug
     * @param {String} str
     * @returns {String}
     */
     const toSlug = (str) => {
        return str?.toLowerCase()?.replace(/\s+/g, "-");
    };


    /**
     * Make text monospace where text is between triple backticks (```)
     *
     * @param {string} text - The text to format
     * @return {string} - Formatted text
     */
    const makeTextMonospace = (text) => {
        return text.replace(/```(.*?)```/g, "<code>$1</code>");
    }

    /**
     * Make text strikethrough where text is between tildes (~~)
     *
     * @param {string} text - The text to format
     * @return {string} - Formatted text
     */
    const makeTextStrikethrough = (text) => {
        return text.replace(/~(.*?)~/g, "<del>$1</del>");
    };


    const capitalizeWords = (str) => {
        return str ? str.replace(/\b\w/g, char => char.toUpperCase()) : 'NA';
    };

    const toSentenceCase = (str) => {
        return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : 'NA';
    };


    const replaceUnderscoreWithSpace = (str) => {
        return str ? str.replace(/_/g, ' ') : '';
    };

    const replaceDashcoreWithSpace = (str) => {
        return str ? str.replace(/-/g, ' ') : '';
    };


    // Function to check if a value matches the search query (including nested objects)
    const matchesSearchQuery = (value, searchLower) => {
        if (value && typeof value === "object") {
            return Object.values(value).some((nestedValue) =>
                matchesSearchQuery(nestedValue, searchLower)
            );
        }
        return String(value)
            .toLowerCase()
            .includes(searchLower);
    };

    // Function to filter a list of items based on a search query
    const filterListBySearchQuery = (list, searchQuery) => {
        const searchLower = searchQuery.toLowerCase();
        return list?.filter((item) => {
            return (
                matchesSearchQuery(item?.name, searchLower) ||
                matchesSearchQuery(item?.last_name, searchLower) ||
                matchesSearchQuery(item?.email, searchLower) ||
                matchesSearchQuery(item?.phone, searchLower) ||
                matchesSearchQuery(item?.whatsapp_phone, searchLower) ||
                matchesSearchQuery(item?.status, searchLower) ||

                (item.main_state && (
                    matchesSearchQuery(item?.main_state?.name, searchLower)
                )) ||

                (item.data && (
                    Object.keys(item.data).some((key) =>
                        matchesSearchQuery(item.data[key], searchLower)
                    )
                )) ||


                (item.user && (
                    matchesSearchQuery(item.user?.name, searchLower) ||
                    (item.user.main_state &&
                        matchesSearchQuery(item.user?.main_state?.name, searchLower)
                    )
                ))
            );
        });
    };

    /**
     * Get Countries JSON Array
     * @param {String} search Search String for Country name
     * @returns {Array}
     */
    const getCountries = async (search = null) => {
        const resp = await axios.get(route('common.json.country',{search}));
        if(!resp.data?.success) {
        }
        return resp.data?.countries || [];
    }

    /**
     * Get States By Country Id
     * @param {Number} country_id
     * @param {String} search Search String for State Name
     * @returns {Array}
     */
    const getStates = async (country_id, search = null) => {
        const resp = await axios.get(route('common.json.state',{country_id, search}));
        if(!resp.data?.success) {
        }
        return resp.data?.states || [];
    }

    /**
     * Get Cities By State Id
     * @param {Number} state_id
     * @param {String} search Search String for State Name
     * @returns {Array}
     */
    const getCities = async (state_id, search = null) => {
        const resp = await axios.get(route('common.json.city',{state_id, search}));
        if(!resp.data?.success) {
        }
        return resp.data?.cities || [];
    }

    /**
     * Resize & Reduce the size of an Image File
     *
     * @param {Blob} img Blob IMage
     * @param {Number} q Compress Quality 0 to 1
     * @param {Number} count Counter for recursive
     * @returns {Blob} Image Blob reduced in size
     */
    const compressImage = (img, q = 0.9, count = 1, maxWidth = 1280, maxHeight = 800) => {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                const maxSize = 500 * 1024;
                reader.onload = (e) => {
                    const i = new Image();
                    i.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        let width = i.width;
                        let height = i.height;

                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }

                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                        canvas.width = i.width;
                        canvas.height = i.height;

                        ctx.drawImage(i, 0, 0, canvas.width, canvas.height);

                        canvas.toBlob(async (blob) => {
                            if(blob) {
                                if(blob.size <= maxSize) {
                                    resolve(blob);
                                } else {
                                    const ij = new File([blob], 'compressed.jpeg', {type: "image/jpeg"});
                                    const compressedBlob = await compressImage(ij, Math.max(0, q-0.2), count+1);
                                    resolve(compressedBlob);
                                }
                            } else {
                                reject(new Error('Failed to compress the image...'))
                            }
                        }, 'image/jpeg', q); // Adjust quality (0-1) as needed
                    }
                    i.src = e.target.result;
                }
                reader.readAsDataURL(img);

            } catch (_e) {
                reject(_e);
            }
        });
    }


    const hasPermissionLike = (permissions = [], prefix = '') => {
        return permissions.some(permission => permission.startsWith(prefix));
    }

    const hasPermission = (permissions = [], name = '') => {
        return permissions.includes(name);
    }

    const hasAnyPermission = (permissions = [], names = []) => {
        return names.some(name => permissions.includes(name));
    }

    return {
        dateFormat,
        generateUrlSearchString,
        copyContent,
        makeTextBoldWithStar,
        makeTextItalicWithUnderscore,
        makeTextMonospace,
        toSlug,
        makeTextStrikethrough,
        capitalizeWords,
        replaceUnderscoreWithSpace,
        replaceDashcoreWithSpace,
        filterListBySearchQuery,
        compressImage,
        toSentenceCase,
        hasPermissionLike,
        hasPermission,
        hasAnyPermission
    };

}
