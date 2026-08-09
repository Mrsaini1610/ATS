import { router } from "@inertiajs/react";
import axios from "axios";
import { auth } from "@/firebase";

import {
RecaptchaVerifier,
signInWithPhoneNumber,
} from "firebase/auth";

import {
Phone,
ArrowRight,
RefreshCw,
CheckCircle2,
ChevronLeft,
Shield,
X,
} from "lucide-react";

import { useState, useRef, useEffect } from "react";

export default function CandidateLoginPopup({
    open,
    onClose,
    jobId,
    onLoginSuccess,
}) {

    const [step, setStep] = useState("phone");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(["","","","","",""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const [confirmationResult, setConfirmationResult] = useState(null);

    const otpRefs = useRef([]);


    useEffect(() => {
        if (resendTimer <= 0) return;

        const t = setTimeout(() => {
            setResendTimer((p) => p - 1);
        }, 1000);

        return () => clearTimeout(t);
    }, [resendTimer]);

    if (!open) return null;

    const handleSendOtp = async (e) => {

    e.preventDefault();

    try {

    setLoading(true);

    setError("");

    const mobile = phone.replace(/\D/g,"");

    if(mobile.length!==10){

    setError("Enter valid phone number");

    setLoading(false);

    return;

    }

    const response = await axios.post(route("check.phone"),{

    phone:mobile,

    });

    if(!response.data.success){

    setError("User not found");

    setLoading(false);

    return;

    }

    if(!window.recaptchaVerifier){

    window.recaptchaVerifier=new RecaptchaVerifier(

    auth,

    "recaptcha-container",

    {

    size:"invisible",

    }

    );

    await window.recaptchaVerifier.render();

    }

    const confirmation = await signInWithPhoneNumber(

    auth,

    "+91"+mobile,

    window.recaptchaVerifier

    );
    setConfirmationResult(confirmation);

// if (!confirmationResult) {
//     setError("Please send OTP first");
//     return;
// }

// const result = await confirmationResult.confirm(code);

    setStep("otp");

    setResendTimer(60);

    setTimeout(()=>{

    otpRefs.current[0]?.focus();

    },100);

    }

    catch(err){

    console.log(err);

    if(err.response?.data?.message){

    setError(err.response.data.message);

    }

    else{

    setError(err.message);

    }

    }

    setLoading(false);

    };

    const handleOtpChange=(i,val)=>{

    if(!/^\d?$/.test(val)) return;

    const next=[...otp];

    next[i]=val;

    setOtp(next);

    if(val && i<5){ otpRefs.current[i+1]?.focus(); } }; const handleOtpKeyDown=(i,e)=>{

        if(e.key==="Backspace" && !otp[i] && i>0){

        otpRefs.current[i-1]?.focus();

        }

        };


        const handleOtpPaste=(e)=>{

        const pasted=e.clipboardData

        .getData("text")

        .replace(/\D/g,"")

        .slice(0,6);

        if(pasted.length===6){

        setOtp(pasted.split(""));

        otpRefs.current[5]?.focus();

        }

        e.preventDefault();

        };


        const handleVerifyOtp = async (e) => {

        e.preventDefault();

        try{

        setLoading(true);

        setError("");

        const code = otp.join("");

        if (!confirmationResult) {
            setError("Please send OTP first");
            setLoading(false);
            return;
        }

        const result = await confirmationResult.confirm(code);

        if(result.user){

    await axios.post(route("phone.login"), {
        phone: phone.replace(/\D/g, ""),
        job_id: jobId,
    });

    onClose();

    router.visit(`/apply/${jobId}`);

        }

        }

        // catch(err){

        // console.log(err);

        // setError("Invalid OTP");

        // }
        catch (err) {
            console.log(err);
            console.log(err.code);
            console.log(err.message);

            setError(err.message);
        }

        setLoading(false);

        };



        return (

        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

                <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl">

                    {/* Header */}

                    <div className="flex items-center justify-between border-b px-6 py-5">

                        <div>

                            <h2 className="text-2xl font-bold text-gray-900">

                                Candidate Login

                            </h2>

                            <p className="text-sm text-gray-500">

                                Login to continue your application

                            </p>

                        </div>

                        <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">

                            <X className="h-5 w-5" />

                        </button>

                    </div>

                    <div className="p-6">

                        {error && (

                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">

                            {error}

                        </div>

                        )}

                        {/* PHONE STEP */}

                        {step==="phone" && (

                        <form onSubmit={handleSendOtp} className="space-y-5">

                            <div>

                                <label className="mb-2 block text-sm font-semibold">

                                    Phone Number

                                </label>

                                <div className="flex gap-2">

                                    <div className="flex items-center rounded-xl border px-4">

                                        +91

                                    </div>

                                    <div className="relative flex-1">

                                        <Phone
                                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                        <input type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)}

                                        placeholder="9876543210"

                                        maxLength={10}

                                        className="w-full rounded-xl border py-3 pl-10 pr-3 outline-none focus:ring-2 focus:ring-blue-500"

                                        />

                                    </div>

                                </div>

                                <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">

                                    <Shield className="h-3 w-3" />

                                    OTP will be sent on your mobile number.

                                </p>

                            </div>

                            <button type="submit" disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">

                                {loading ?

                                <span
                                    className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />

                                :

                                <>

                                    Send OTP

                                    <ArrowRight className="h-4 w-4" />

                                </>

                                }

                            </button>

                        </form>

                        )}

                        {/* OTP STEP */}

                        {step==="otp" && (

                        <form onSubmit={handleVerifyOtp} className="space-y-6">

                            <div>

                                <label className="mb-4 block text-center font-semibold">

                                    Enter OTP

                                </label>

                                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>

                                    {otp.map((digit,i)=>(

                                    <input key={i} ref={(el)=>otpRefs.current[i]=el}

                                    type="text"

                                    maxLength={1}

                                    value={digit}

                                    inputMode="numeric"

                                    onChange={(e)=>handleOtpChange(i,e.target.value)}

                                    onKeyDown={(e)=>handleOtpKeyDown(i,e)}

                                    className="h-12 w-12 rounded-xl border-2 text-center text-xl font-bold focus:border-blue-500 focus:outline-none"

                                    />

                                    ))}

                                </div>

                            </div>

                            <div className="text-center">

                                {resendTimer>0 ?

                                <p className="text-sm text-gray-500">

                                    Resend in

                                    <span className="ml-1 font-semibold text-blue-600">

                                        {resendTimer}s

                                    </span>

                                </p>

                                :

                                <button type="button" className="mx-auto flex items-center gap-1 text-sm text-blue-600"
                                    onClick={handleSendOtp}>

                                    <RefreshCw className="h-4 w-4" />

                                    Resend OTP

                                </button>

                                }

                            </div>

                            <button type="submit" disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">

                                {loading ?

                                <span
                                    className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />

                                :

                                <>

                                    <CheckCircle2 className="h-4 w-4" />

                                    Verify & Login

                                </>

                                }

                            </button>

                            <button type="button" onClick={()=>{

                                setStep("phone");

                                setOtp(["","","","","",""]);

                                }}

                                className="flex w-full items-center justify-center gap-2 text-gray-500"

                                >

                                <ChevronLeft className="h-4 w-4" />

                                Change Number

                            </button>

                        </form>

                        )}

                    </div>

                </div>

            </div>

            <div id="recaptcha-container"></div>

        </>

        );


        }
