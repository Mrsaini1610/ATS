import React, { useState, useEffect,useMemo, useCallback } from "react";
import { Dialog } from "@headlessui/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import axios from "axios";
import { toast } from "react-hot-toast";

const UploadDocument = ({ isOpenModal, setIsOpenModal, member }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [taskDocs, setTaskDocs] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);

   const fileIcons = useMemo(() => ({
    pdf: "📄",
    doc: "📝",
    docx: "📝",
    xls: "📊",
    xlsx: "📊",
    ppt: "📑",
    pptx: "📑",
    jpg: "🖼️",
    jpeg: "🖼️",
    png: "🖼️",
}), []);


    // Load documents when modal opens
   useEffect(() => {
    if (isOpenModal && member?.id) {
        const loadDocuments = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    route('super.documents.staff.list', { staff: member.id })
                );
                setTaskDocs(response.data.documents || []);
            } catch (error) {
                console.error('Error loading documents:', error);
                toast.error('Failed to load documents');
                setTaskDocs([]);
            } finally {
                setLoading(false);
            }
        };
        loadDocuments();
    } else {
        setTaskDocs([]);
    }
}, [isOpenModal, member?.id]);

    // Drag and drop handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    };

    const handleFileUpload = async (files) => {
        if (!files || files.length === 0) return;
        if (!member || !member.id) {
            toast.error('No staff member selected');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('documents[]', files[i]);
            }
            formData.append('member', member.id);

            const response = await axios.post(
                route('super.documents.staff.store'),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentCompleted);
                    }
                }
            );
            if (response.data.uploaded_documents) {
                setTaskDocs(prevDocs => [...prevDocs, ...response.data.uploaded_documents]);
                        await loadDocuments();
                toast.success(response.data.success || 'Documents uploaded successfully');
            } else {
                setTaskDocs(prevDocs => [...prevDocs, ...(response.data.documents || [])]);
                        await loadDocuments();
            }
        } catch (error) {
            console.error('Error uploading documents:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to upload documents');
            }
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };
      const loadDocuments = useCallback(async () => {
        if (!member?.id) return;

        try {
            setLoading(true);
            const response = await axios.get(
                route('super.documents.staff.list', { staff: member.id })
            );
            setTaskDocs(response.data.documents || []);
        } catch (error) {
            console.error('Error loading documents:', error);
            toast.error('Failed to load documents');
            setTaskDocs([]);
        } finally {
            setLoading(false);
        }
    }, [member?.id]);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files);
        }
    };

    const handleDeleteDoc = async (docId) => {
        try {
            await axios.delete(route('super.documents.staff.destroys', { document: docId }));
            toast.success('Document deleted successfully');
            setTaskDocs(prevDocs => prevDocs.filter(doc => doc.id !== docId));
        } catch (error) {
            console.error('Error deleting document:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to delete document');
            }
        }
    };

    const openDocument = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Get file extension
    const getFileExtension = (fileName) => {
        if (!fileName) return '';
        const parts = fileName.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
    };
    return (
        <Dialog
            open={isOpenModal}
            onClose={() => setIsOpenModal(false)}
            className="relative z-50"
        >
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center">
                <Dialog.Panel className="relative w-[96%] max-w-[600px] rounded-[10px] md:rounded-2xl bg-white p-2 md:p-6 shadow-xl">
                    <button
                        type="button"
                        onClick={() => setIsOpenModal(false)}
                        className="absolute top-4 right-4 z-20 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="pb-[15px] mb-[15px] border-b border-[#f2f2f2] pr-14">
                        <Dialog.Title className="text-[18px] font-[500] text-[#151547]">
                            Upload Documents {member && `for: ${member.name}`}
                        </Dialog.Title>
                    </div>

                    {/* Upload box */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        className={`mt-4 flex flex-col items-center justify-center gap-[20px] border-2 border-dashed ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-[#5146E6] bg-[#5146E61A]'} rounded-xl p-[30px] text-center transition-colors`}
                    >
                        <svg
                            width="45"
                            height="45"
                            viewBox="0 0 45 45"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M22.4992 18.75V35.625M22.4992 18.75L28.1242 24.375M22.4992 18.75L16.8742 24.375M32.8117 28.125C35.6598 28.125 37.4992 25.8169 37.4992 22.9688C37.4991 21.8412 37.1294 20.7447 36.4467 19.8473C35.764 18.9499 34.8059 18.301 33.7192 18C33.552 15.8971 32.6805 13.9121 31.2455 12.3658C29.8105 10.8196 27.896 9.80246 25.8114 9.47895C23.7268 9.15545 21.5941 9.54445 19.7579 10.5831C17.9218 11.6217 16.4896 13.2492 15.693 15.2025C14.0156 14.7376 12.2223 14.958 10.7075 15.8152C9.19264 16.6725 8.08041 18.0964 7.61546 19.7738C7.1505 21.4511 7.3709 23.2444 8.22818 24.7593C9.08545 26.2741 10.5094 27.3863 12.1867 27.8513"
                                stroke="#5146E6"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        <p className="text-gray-600">Drag & Drop Here</p>
                        <label className="text-indigo-600 font-semibold hover:underline cursor-pointer">
                            Browse File
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileSelect}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                            />
                        </label>

                        {uploading && (
                            <div className="w-full mt-2">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Uploading ({uploadProgress}%)</span>
                                    <span>{uploadProgress === 100 ? 'Processing...' : ''}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6">
                        <p className="text-[14px] text-[#727272] uppercase mb-2">
                            Uploaded Documents ({taskDocs?.length || 0})
                        </p>

                        {loading ? (
                            <div className="text-center py-4 text-gray-500">
                                Loading documents...
                            </div>
                        ) : taskDocs && taskDocs.length > 0 ? (
                            <div className="relative viewDocumentdlider">
                                <Swiper
                                    modules={[Navigation]}
                                    spaceBetween={10}
                                    breakpoints={{
                                        0: { slidesPerView: 2 },
                                        640: { slidesPerView: 6 },
                                    }}
                                    navigation={true}
                                >
                                    {taskDocs.map((file) => {
                                        const fileExt = getFileExtension(file.url || file.image_path).toLowerCase();
                                        const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt);
                                        const fileUrl = file.url || file.image_path;

                                        return (
                                            <SwiperSlide key={file.id} className="py-[10px]">
                                                <div className="group flex flex-col items-center justify-center w-full h-20 rounded-xl drop-shadow-md bg-white relative overflow-hidden">
                                                    {isImage ? (
                                                        // Show image preview
                                                        <img
                                                            src={fileUrl}
                                                            alt={fileExt}
                                                            className="h-full w-full object-cover rounded-xl"
                                                        />
                                                    ) : (
                                                        // Show file icon
                                                        <>
                                                            <span className="text-2xl">
                                                                {fileIcons[fileExt] || fileIcons["doc"]}
                                                            </span>
                                                            <span className="text-xs mt-1 uppercase">{fileExt}</span>
                                                        </>
                                                    )}

                                                    {/* Hover buttons (View / Delete) */}
                                                    <div className="absolute inset-0 flex items-center justify-center gap-[2px] bg-white/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openDocument(fileUrl);
                                                            }}
                                                            className="px-[5px] py-[7px] rounded-[3px] bg-[#5146E61A]"
                                                        >
                                                            👁️
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteDoc(file.id);
                                                            }}
                                                            className="px-[5px] py-[7px] rounded-[3px] bg-[#5146E61A]"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            </SwiperSlide>
                                        );
                                    })}
                                </Swiper>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                No documents uploaded yet
                            </div>
                        )}
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default UploadDocument;
