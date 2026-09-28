export default function ApplicationLogo(props) {
    const lightLogo = props?.props?.light_logo_path ? `/storage/${props?.props?.light_logo_path}` : "/images/logo.png";
    const darkLogo = props?.props?.dark_logo_path ? `/storage/${props?.props?.dark_logo_path}` : "/images/logo-dark.png";

    return (
        <>
            <div className="block dark:hidden">
                <img
                    className="max-w-[32px] md:max-w-[40px] h-auto rounded-xl object-contain"
                    src={lightLogo}
                    alt="ATS.com"
                />
            </div>
            <div className="hidden dark:block">
                <img
                    className="max-w-[32px] md:max-w-[40px] h-auto rounded-xl object-contain"
                    src={darkLogo}
                    alt="ATS.com"
                />
            </div>
        </>
    );
}
