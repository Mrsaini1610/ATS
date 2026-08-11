import { useEffect, useMemo, useState } from "react";

const normalizeUrl = (url) => {
    if (!url) return null;

    const value = String(url).trim();
    if (!value) return null;

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    return value.startsWith("/") ? value : `/${value}`;
};

async function probeUrl(url) {
    if (!url) return false;

    try {
        const headResponse = await fetch(url, {
            method: "HEAD",
            credentials: "same-origin",
        });

        if (headResponse.ok) {
            return true;
        }

        if (headResponse.status !== 405) {
            return false;
        }

        const getResponse = await fetch(url, {
            method: "GET",
            credentials: "same-origin",
        });

        return getResponse.ok;
    } catch {
        return false;
    }
}

export default function ResumePreviewModal({
    isOpen,
    sourceUrl,
    fallbackUrl,
    title = "Resume Preview",
    onClose,
}) {
    const normalizedSourceUrl = useMemo(() => normalizeUrl(sourceUrl), [sourceUrl]);
    const normalizedFallbackUrl = useMemo(() => normalizeUrl(fallbackUrl), [fallbackUrl]);

    const [resolvedUrl, setResolvedUrl] = useState(null);
    const [checking, setChecking] = useState(false);
    const [usingFallback, setUsingFallback] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!isOpen) {
            setResolvedUrl(null);
            setUsingFallback(false);
            setErrorMessage("");
            setChecking(false);
            return;
        }

        let active = true;

        const resolvePreviewUrl = async () => {
            setChecking(true);
            setErrorMessage("");
            setResolvedUrl(null);
            setUsingFallback(false);

            if (normalizedSourceUrl && (await probeUrl(normalizedSourceUrl))) {
                if (!active) return;
                setResolvedUrl(normalizedSourceUrl);
                setChecking(false);
                return;
            }

            if (normalizedFallbackUrl) {
                if (!active) return;
                setResolvedUrl(normalizedFallbackUrl);
                setUsingFallback(true);
                setChecking(false);
                return;
            }

            if (!active) return;
            setErrorMessage(
                "Resume file is unavailable and no generated preview could be created from candidate information."
            );
            setChecking(false);
        };

        resolvePreviewUrl();

        return () => {
            active = false;
        };
    }, [isOpen, normalizedSourceUrl, normalizedFallbackUrl]);

    const handleIframeError = () => {
        if (!usingFallback && normalizedFallbackUrl && normalizedFallbackUrl !== resolvedUrl) {
            setResolvedUrl(normalizedFallbackUrl);
            setUsingFallback(true);
            setErrorMessage("");
            return;
        }

        setResolvedUrl(null);
        setErrorMessage(
            "Unable to preview this resume. The uploaded file may be missing or inaccessible."
        );
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full overflow-hidden border border-slate-200">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-5 right-5 z-20 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-100 transition-colors border border-slate-200"
                >
                    <svg
                        className="w-5 h-5 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                <div className="px-6 py-5 pr-20 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <div className="text-lg font-semibold text-slate-900">
                                {title}
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                                Review candidate resume inside the panel without leaving the page.
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {usingFallback && !checking && (
                                <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-xs font-medium">
                                    Generated From Candidate Data
                                </span>
                            )}

                            {resolvedUrl && (
                                <a
                                    href={resolvedUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center rounded-full bg-slate-900 text-white px-3 py-1.5 text-xs font-medium hover:bg-slate-800 transition-colors"
                                >
                                    Open In New Tab
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {usingFallback && !checking && (
                    <div className="mx-6 mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-800">
                        Uploaded resume file is not accessible right now, so a generated preview is
                        being shown using candidate information available in the system.
                    </div>
                )}

                <div className="h-[78vh] bg-slate-100">
                    {checking ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm gap-4">
                            <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-slate-700 animate-spin" />
                            <div className="font-medium text-slate-700">
                                Loading resume preview...
                            </div>
                            <div className="text-slate-500">
                                Checking uploaded file and preparing the best available preview.
                            </div>
                        </div>
                    ) : resolvedUrl ? (
                        <iframe
                            src={resolvedUrl}
                            title={title}
                            className="w-full h-full bg-white"
                            onError={handleIframeError}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center px-6">
                            <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                                <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                                    <svg
                                        className="w-7 h-7"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.8}
                                            d="M12 9v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                                        />
                                    </svg>
                                </div>
                                <div className="text-lg font-semibold text-slate-900 mb-2">
                                    Preview Unavailable
                                </div>
                                <div className="text-sm text-slate-500 leading-6">
                                    {errorMessage}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
