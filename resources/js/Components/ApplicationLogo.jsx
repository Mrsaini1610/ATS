export default function ApplicationLogo(props) {
    const lightLogo = props?.props?.light_logo_path ? `/storage/${props?.props?.light_logo_path}` : "/images/logo.png";
    const darkLogo = props?.props?.dark_logo_path ? `/storage/${props?.props?.dark_logo_path}` : "/images/logo-dark.png";

    return (
        <>
            <div className="block dark:hidden">
                <img
                    className="max-w-[20px] md:max-w-[30px] rounded-full"
                    src={lightLogo}
                    alt="Logo"
                />
            </div>
            <div className="hidden dark:block">
                <img
                    className="max-w-[20px] md:max-w-[30px] rounded-full"
                    src={darkLogo}
                    alt="Logo"
                />
            </div>
        </>
    );
}
