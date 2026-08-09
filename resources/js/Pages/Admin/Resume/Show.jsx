import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "../Layouts/AuthenticatedLayout";

export default function ResumeShow({ resume }) {
    const photoUrl = resume.profile_photo
        ? `/storage/${resume.profile_photo}`
        : null;

    const downloadPdf = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Resume Preview - ${resume.name}`} />

            <div className="min-h-screen py-[40px] memberbg">
                <div className="mt-[64px] px-[15px]">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-4 print:hidden">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            Resume Preview
                        </h2>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={downloadPdf}
                                className="px-4 py-2 rounded-md text-sm bg-[rgb(82_70_230)] hover:bg-[rgb(82_70_230)/0.9] text-white"
                            >
                                Download PDF
                            </button>
                            <Link
                                href={route("admin.resumes.edit", resume.id)}
                                className="px-4 py-2 rounded-md text-sm bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Edit
                            </Link>
                            <Link
                                href={route("admin.resumes.index")}
                                className="px-4 py-2 rounded-md text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                Back
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0a0e25] rounded-[15px] p-8 shadow print:shadow-none print:p-0">
                        <div className="flex items-start justify-between gap-6 flex-wrap">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {resume.name}
                                </h1>
                                {resume.job_title && (
                                    <div className="text-lg text-gray-700 dark:text-gray-300 mt-1">
                                        {resume.job_title}
                                    </div>
                                )}

                                <div className="text-sm text-gray-600 dark:text-gray-300 mt-4 space-y-1">
                                    <div>{resume.email}</div>
                                    {resume.phone && <div>{resume.phone}</div>}
                                    {resume.location && (
                                        <div>{resume.location}</div>
                                    )}
                                    <div className="flex flex-wrap gap-3 mt-2">
                                        {resume.linkedin && (
                                            <a
                                                className="text-[rgb(82_70_230)] underline"
                                                href={resume.linkedin}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                LinkedIn
                                            </a>
                                        )}
                                        {resume.github && (
                                            <a
                                                className="text-[rgb(82_70_230)] underline"
                                                href={resume.github}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                GitHub
                                            </a>
                                        )}
                                        {resume.portfolio && (
                                            <a
                                                className="text-[rgb(82_70_230)] underline"
                                                href={resume.portfolio}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Portfolio
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {photoUrl && (
                                <img
                                    src={photoUrl}
                                    alt={resume.name}
                                    className="w-24 h-24 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                />
                            )}
                        </div>

                        {resume.summary && (
                            <section className="mt-8">
                                <h3 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white uppercase">
                                    Summary
                                </h3>
                                <p className="text-gray-700 dark:text-gray-200 mt-2 whitespace-pre-line">
                                    {resume.summary}
                                </p>
                            </section>
                        )}

                        {resume.skills?.length > 0 && (
                            <section className="mt-8">
                                <h3 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white uppercase">
                                    Skills
                                </h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {resume.skills.map((s) => (
                                        <span
                                            key={s.id}
                                            className="text-xs px-3 py-1 rounded-full bg-[rgb(82_70_230)]/10 text-[rgb(82_70_230)] dark:text-white dark:bg-[rgb(82_70_230)]/30"
                                        >
                                            {s.skill_name}{" "}
                                            <span className="opacity-70">
                                                ({s.skill_type})
                                            </span>
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {resume.experiences?.length > 0 && (
                            <section className="mt-8">
                                <h3 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white uppercase">
                                    Experience
                                </h3>
                                <div className="mt-3 space-y-4">
                                    {resume.experiences.map((e) => (
                                        <div key={e.id}>
                                            <div className="flex justify-between flex-wrap gap-2">
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    {e.job_title} —{" "}
                                                    {e.company_name}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    {e.start_date || "-"}{" "}
                                                    {e.end_date
                                                        ? `to ${e.end_date}`
                                                        : ""}
                                                </div>
                                            </div>
                                            {e.location && (
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    {e.location}
                                                </div>
                                            )}
                                            {e.description && (
                                                <div className="text-gray-700 dark:text-gray-200 mt-2 whitespace-pre-line">
                                                    {e.description}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {resume.educations?.length > 0 && (
                            <section className="mt-8">
                                <h3 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white uppercase">
                                    Education
                                </h3>
                                <div className="mt-3 space-y-3">
                                    {resume.educations.map((e) => (
                                        <div key={e.id}>
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                {e.degree || "-"}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                {e.institute || "-"}{" "}
                                                {(e.start_year || e.end_year) &&
                                                    `(${e.start_year || ""}${
                                                        e.end_year
                                                            ? ` - ${e.end_year}`
                                                            : ""
                                                    })`}
                                            </div>
                                            {e.percentage && (
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    {e.percentage}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {resume.projects?.length > 0 && (
                            <section className="mt-8">
                                <h3 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white uppercase">
                                    Projects
                                </h3>
                                <div className="mt-3 space-y-4">
                                    {resume.projects.map((p) => (
                                        <div key={p.id}>
                                            <div className="flex justify-between flex-wrap gap-2">
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    {p.title}
                                                </div>
                                                {p.project_link && (
                                                    <a
                                                        className="text-sm text-[rgb(82_70_230)] underline"
                                                        href={p.project_link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        Link
                                                    </a>
                                                )}
                                            </div>
                                            {p.technologies && (
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    {p.technologies}
                                                </div>
                                            )}
                                            {p.description && (
                                                <div className="text-gray-700 dark:text-gray-200 mt-2 whitespace-pre-line">
                                                    {p.description}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {resume.certifications?.length > 0 && (
                            <section className="mt-8">
                                <h3 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white uppercase">
                                    Certifications
                                </h3>
                                <ul className="mt-3 space-y-2">
                                    {resume.certifications.map((c) => (
                                        <li
                                            key={c.id}
                                            className="text-gray-700 dark:text-gray-200"
                                        >
                                            <span className="font-medium">
                                                {c.title}
                                            </span>
                                            {c.platform && ` — ${c.platform}`}
                                            {c.year && ` (${c.year})`}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {resume.achievements?.length > 0 && (
                            <section className="mt-8">
                                <h3 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white uppercase">
                                    Achievements
                                </h3>
                                <ul className="mt-3 space-y-2">
                                    {resume.achievements.map((a) => (
                                        <li
                                            key={a.id}
                                            className="text-gray-700 dark:text-gray-200"
                                        >
                                            <span className="font-medium">
                                                {a.title}
                                            </span>
                                            {a.description
                                                ? ` — ${a.description}`
                                                : ""}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {resume.languages?.length > 0 && (
                            <section className="mt-8">
                                <h3 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white uppercase">
                                    Languages
                                </h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {resume.languages.map((l) => (
                                        <span
                                            key={l.id}
                                            className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                                        >
                                            {l.language}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

