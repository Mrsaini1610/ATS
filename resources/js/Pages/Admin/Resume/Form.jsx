import { Head, Link, router, useForm } from "@inertiajs/react";
import { useMemo, useState } from "react";
import AuthenticatedLayout from "../Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import ImageInputPreview from "@/Components/ImageInputPreview";
import RepeatableSection from "./Partials/RepeatableSection";

const inputClass =
    "w-full text-sm selectbg border rounded-md px-[18px] py-[12px] focus:outline-none box-shadow-none";

function normalizeResume(resume) {
    if (!resume) {
        return {
            name: "",
            job_title: "",
            email: "",
            phone: "",
            location: "",
            linkedin: "",
            github: "",
            portfolio: "",
            summary: "",
            profile_photo: null,
            skills: [],
            experiences: [],
            educations: [],
            projects: [],
            certifications: [],
            achievements: [],
            languages: [],
        };
    }

    return {
        name: resume.name || "",
        job_title: resume.job_title || "",
        email: resume.email || "",
        phone: resume.phone || "",
        location: resume.location || "",
        linkedin: resume.linkedin || "",
        github: resume.github || "",
        portfolio: resume.portfolio || "",
        summary: resume.summary || "",
        profile_photo: null,
        skills: (resume.skills || []).map((s) => ({
            skill_name: s.skill_name || "",
            skill_type: s.skill_type || "technical",
        })),
        experiences: (resume.experiences || []).map((e) => ({
            company_name: e.company_name || "",
            job_title: e.job_title || "",
            start_date: e.start_date || "",
            end_date: e.end_date || "",
            location: e.location || "",
            description: e.description || "",
        })),
        educations: (resume.educations || []).map((e) => ({
            degree: e.degree || "",
            institute: e.institute || "",
            start_year: e.start_year || "",
            end_year: e.end_year || "",
            percentage: e.percentage || "",
        })),
        projects: (resume.projects || []).map((p) => ({
            title: p.title || "",
            technologies: p.technologies || "",
            project_link: p.project_link || "",
            description: p.description || "",
        })),
        certifications: (resume.certifications || []).map((c) => ({
            title: c.title || "",
            platform: c.platform || "",
            year: c.year || "",
        })),
        achievements: (resume.achievements || []).map((a) => ({
            title: a.title || "",
            description: a.description || "",
        })),
        languages: (resume.languages || []).map((l) => ({
            language: l.language || "",
        })),
    };
}

export default function ResumeForm({ mode, resume }) {
    const initial = useMemo(() => normalizeResume(resume), [resume]);
    const { data, setData, errors, processing } = useForm(initial);

    const [skills, setSkills] = useState(initial.skills || []);
    const [experiences, setExperiences] = useState(initial.experiences || []);
    const [educations, setEducations] = useState(initial.educations || []);
    const [projects, setProjects] = useState(initial.projects || []);
    const [certifications, setCertifications] = useState(
        initial.certifications || []
    );
    const [achievements, setAchievements] = useState(
        initial.achievements || []
    );
    const [languages, setLanguages] = useState(initial.languages || []);

    const submit = (e) => {
        e.preventDefault();

        const payload = {
            ...data,
            skills,
            experiences,
            educations,
            projects,
            certifications,
            achievements,
            languages,
        };

        if (mode === "edit") {
            router.post(route("admin.resumes.update", resume.id), payload, {
                forceFormData: true,
                preserveScroll: true,
            });
        } else {
            router.post(route("admin.resumes.store"), payload, {
                forceFormData: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head
                title={mode === "edit" ? "Edit Resume" : "Create Resume"}
            />
            <div className="min-h-screen py-[40px] memberbg">
                <div className="mt-[64px] px-[15px]">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {mode === "edit" ? "Edit Resume" : "Create Resume"}
                        </h2>
                        <div className="flex gap-2">
                            {mode === "edit" && (
                                <Link
                                    href={route("admin.resumes.show", resume.id)}
                                    className="px-4 py-2 rounded-md text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                                >
                                    Preview
                                </Link>
                            )}
                            <Link
                                href={route("admin.resumes.index")}
                                className="px-4 py-2 rounded-md text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                Back
                            </Link>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="tablebxbg p-[15px] rounded-[15px]">
                            <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
                                Basic Info
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-700 dark:text-gray-300">
                                        Name *
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-700 dark:text-gray-300">
                                        Job Title
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.job_title}
                                        onChange={(e) =>
                                            setData(
                                                "job_title",
                                                e.target.value
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.job_title}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-700 dark:text-gray-300">
                                        Email *
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-700 dark:text-gray-300">
                                        Phone
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData("phone", e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.phone}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-700 dark:text-gray-300">
                                        Location
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.location}
                                        onChange={(e) =>
                                            setData(
                                                "location",
                                                e.target.value
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.location}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-700 dark:text-gray-300">
                                        LinkedIn
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.linkedin}
                                        onChange={(e) =>
                                            setData(
                                                "linkedin",
                                                e.target.value
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.linkedin}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-700 dark:text-gray-300">
                                        GitHub
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.github}
                                        onChange={(e) =>
                                            setData("github", e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.github}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-700 dark:text-gray-300">
                                        Portfolio
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.portfolio}
                                        onChange={(e) =>
                                            setData(
                                                "portfolio",
                                                e.target.value
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.portfolio}
                                        className="mt-1"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <ImageInputPreview
                                        id="profile_photo"
                                        label="Profile Photo"
                                        setData={setData}
                                        error={errors.profile_photo}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="tablebxbg p-[15px] rounded-[15px]">
                            <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
                                Summary
                            </h3>
                            <textarea
                                className={`${inputClass} min-h-[120px]`}
                                value={data.summary}
                                onChange={(e) =>
                                    setData("summary", e.target.value)
                                }
                            />
                            <InputError
                                message={errors.summary}
                                className="mt-1"
                            />
                        </div>

                        <RepeatableSection
                            title="Skills"
                            items={skills}
                            setItems={setSkills}
                            addLabel="Add Skill"
                            emptyItem={{ skill_name: "", skill_type: "technical" }}
                        >
                            {({ item, idx }) => (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Skill Name
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={item.skill_name}
                                            onChange={(e) =>
                                                setSkills((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  skill_name:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    `skills.${idx}.skill_name`
                                                ]
                                            }
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Type
                                        </label>
                                        <select
                                            className={inputClass}
                                            value={item.skill_type}
                                            onChange={(e) =>
                                                setSkills((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  skill_type:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        >
                                            <option value="technical">
                                                Technical
                                            </option>
                                            <option value="soft">Soft</option>
                                        </select>
                                        <InputError
                                            message={
                                                errors[
                                                    `skills.${idx}.skill_type`
                                                ]
                                            }
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            )}
                        </RepeatableSection>

                        <RepeatableSection
                            title="Experience"
                            items={experiences}
                            setItems={setExperiences}
                            addLabel="Add Experience"
                            emptyItem={{
                                company_name: "",
                                job_title: "",
                                start_date: "",
                                end_date: "",
                                location: "",
                                description: "",
                            }}
                        >
                            {({ item, idx }) => (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Company Name
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={item.company_name}
                                            onChange={(e) =>
                                                setExperiences((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  company_name:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    `experiences.${idx}.company_name`
                                                ]
                                            }
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Job Title
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={item.job_title}
                                            onChange={(e) =>
                                                setExperiences((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  job_title:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    `experiences.${idx}.job_title`
                                                ]
                                            }
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            className={inputClass}
                                            value={item.start_date || ""}
                                            onChange={(e) =>
                                                setExperiences((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  start_date:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            className={inputClass}
                                            value={item.end_date || ""}
                                            onChange={(e) =>
                                                setExperiences((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  end_date:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Location
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={item.location}
                                            onChange={(e) =>
                                                setExperiences((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  location:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Description
                                        </label>
                                        <textarea
                                            className={`${inputClass} min-h-[90px]`}
                                            value={item.description}
                                            onChange={(e) =>
                                                setExperiences((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  description:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </RepeatableSection>

                        <RepeatableSection
                            title="Education"
                            items={educations}
                            setItems={setEducations}
                            addLabel="Add Education"
                            emptyItem={{
                                degree: "",
                                institute: "",
                                start_year: "",
                                end_year: "",
                                percentage: "",
                            }}
                        >
                            {({ item, idx }) => (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Degree
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={item.degree}
                                            onChange={(e) =>
                                                setEducations((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  degree: e
                                                                      .target
                                                                      .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Institute
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={item.institute}
                                            onChange={(e) =>
                                                setEducations((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  institute:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Start Year
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={item.start_year}
                                            onChange={(e) =>
                                                setEducations((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  start_year:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            End Year
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={item.end_year}
                                            onChange={(e) =>
                                                setEducations((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  end_year:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Percentage
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={item.percentage}
                                            onChange={(e) =>
                                                setEducations((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  percentage:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </RepeatableSection>

                        <RepeatableSection
                            title="Projects"
                            items={projects}
                            setItems={setProjects}
                            addLabel="Add Project"
                            emptyItem={{
                                title: "",
                                technologies: "",
                                project_link: "",
                                description: "",
                            }}
                        >
                            {({ item, idx }) => (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Title
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={item.title}
                                            onChange={(e) =>
                                                setProjects((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  title: e
                                                                      .target
                                                                      .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Technologies
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={item.technologies}
                                            onChange={(e) =>
                                                setProjects((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  technologies:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Project Link
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={item.project_link}
                                            onChange={(e) =>
                                                setProjects((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  project_link:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Description
                                        </label>
                                        <textarea
                                            className={`${inputClass} min-h-[90px]`}
                                            value={item.description}
                                            onChange={(e) =>
                                                setProjects((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  description:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </RepeatableSection>

                        <RepeatableSection
                            title="Certifications"
                            items={certifications}
                            setItems={setCertifications}
                            addLabel="Add Certification"
                            emptyItem={{ title: "", platform: "", year: "" }}
                        >
                            {({ item, idx }) => (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Title
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={item.title}
                                            onChange={(e) =>
                                                setCertifications((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  title: e
                                                                      .target
                                                                      .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Platform
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={item.platform}
                                            onChange={(e) =>
                                                setCertifications((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  platform:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Year
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={item.year}
                                            onChange={(e) =>
                                                setCertifications((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  year: e.target
                                                                      .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </RepeatableSection>

                        <RepeatableSection
                            title="Achievements"
                            items={achievements}
                            setItems={setAchievements}
                            addLabel="Add Achievement"
                            emptyItem={{ title: "", description: "" }}
                        >
                            {({ item, idx }) => (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Title
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={item.title}
                                            onChange={(e) =>
                                                setAchievements((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  title: e
                                                                      .target
                                                                      .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Description
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={item.description}
                                            onChange={(e) =>
                                                setAchievements((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  description:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </RepeatableSection>

                        <RepeatableSection
                            title="Languages"
                            items={languages}
                            setItems={setLanguages}
                            addLabel="Add Language"
                            emptyItem={{ language: "" }}
                        >
                            {({ item, idx }) => (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-700 dark:text-gray-300">
                                            Language
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={item.language}
                                            onChange={(e) =>
                                                setLanguages((prev) =>
                                                    prev.map((p, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...p,
                                                                  language:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : p
                                                    )
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors[
                                                    `languages.${idx}.language`
                                                ]
                                            }
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            )}
                        </RepeatableSection>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className={`px-6 py-3 rounded-md text-white font-medium ${
                                    processing
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-[rgb(82_70_230)] hover:bg-[rgb(82_70_230)/0.9]"
                                }`}
                            >
                                {processing
                                    ? "Saving..."
                                    : mode === "edit"
                                    ? "Update Resume"
                                    : "Create Resume"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

