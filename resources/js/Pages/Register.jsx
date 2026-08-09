import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/Contexts/ThemeContext';
import { ThemeProvider } from '@/Contexts/ThemeContext';
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Building2,
    ArrowRight,
    CheckCircle,
    Sparkles,
    Zap,
    Shield,
    Rocket,
    Star,
    Heart,
    Users,
    Briefcase,
    TrendingUp,
    X,
    Phone,
    MapPin
} from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const floatVariants = {
    initial: { y: 0 },
    animate: {
        y: [-10, 10, -10],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const glowVariants = {
    initial: { opacity: 0.5 },
    animate: {
        opacity: [0.5, 1, 0.5],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

function RegisterContent() {
    const { isDark } = useTheme();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        company: '',
        role: 'candidate',
        experience: '',
        location: '',
        skills: '',
        verification_code: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    const totalSteps = 5;
    
    const steps = [
        { number: 1, title: 'Personal Info', icon: User },
        { number: 2, title: 'Contact', icon: Mail },
        { number: 3, title: 'Professional', icon: Building2 },
        { number: 4, title: 'Security', icon: Lock },
        { number: 5, title: 'Verification', icon: CheckCircle }
    ];

    const bgColor = isDark ? 'bg-[#0f172a]' : 'bg-gray-50';
    const cardBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const subTextColor = isDark ? 'text-gray-400' : 'text-gray-600';
    const inputBg = isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateStep = (step) => {
        const newErrors = {};
        
        if (step === 1) {
            if (!formData.name.trim()) {
                newErrors.name = 'Full name is required';
            } else if (formData.name.length < 2) {
                newErrors.name = 'Name must be at least 2 characters';
            }
        }
        
        if (step === 2) {
            if (!formData.email.trim()) {
                newErrors.email = 'Email address is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Please enter a valid email address';
            }
            
            if (!formData.phone.trim()) {
                newErrors.phone = 'Phone number is required';
            } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
                newErrors.phone = 'Please enter a valid phone number';
            }
        }
        
        if (step === 3) {
            // Company is now optional, no validation needed
            if (!formData.location.trim()) {
                newErrors.location = 'Location is required';
            }
        }
        
        if (step === 4) {
            if (!formData.password) {
                newErrors.password = 'Password is required';
            } else if (formData.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters';
            }
            
            if (!formData.password_confirmation) {
                newErrors.password_confirmation = 'Please confirm your password';
            } else if (formData.password !== formData.password_confirmation) {
                newErrors.password_confirmation = 'Passwords do not match';
            }
        }
        
        if (step === 5) {
            if (!formData.verification_code.trim()) {
                newErrors.verification_code = 'Verification code is required';
            } else if (!/^\d{6}$/.test(formData.verification_code)) {
                newErrors.verification_code = 'Please enter a valid 6-digit code';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleStepClick = (stepNumber) => {
        if (stepNumber < currentStep || validateStep(currentStep)) {
            setCurrentStep(stepNumber);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateStep(currentStep)) {
            return;
        }
        
        if (currentStep < totalSteps) {
            handleNextStep();
            return;
        }
        
        setIsLoading(true);
        setErrors({});

        // Simulate API call for verification (frontend only)
        setTimeout(() => {
            console.log('Verification data:', formData);
            
            // Simulate verification code validation
            if (formData.verification_code === '123456') {
                setNotificationMessage('Email verified successfully!. Welcome to our professional community!');
                setShowNotification(true);
                setIsLoading(false);
                
                // Redirect to login page after 3 seconds
                setTimeout(() => {
                    window.location.href = route('login');
                }, 3000);
            } else {
                setErrors({ verification_code: 'Invalid verification code. Please try again.' });
                setIsLoading(false);
            }
        }, 2000);
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className={`block text-sm font-semibold mb-3 ${textColor}`}>
                                Full Name
                            </label>
                            <div className="relative">
                                <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center ${subTextColor}`}>
                                    <motion.div whileHover={{ scale: 1.2 }}>
                                        <User className="w-4 h-4" />
                                    </motion.div>
                                </div>
                                <motion.input
                                    whileFocus={{ scale: 1.02 }}
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-3 py-1 rounded-lg border ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 text-sm`}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                            <AnimatePresence>
                                {errors.name && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-2 text-sm text-red-500 flex items-center gap-2"
                                    >
                                        <Shield className="w-4 h-4" />
                                        {errors.name}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        <div>
                            <label className={`block text-sm font-semibold mb-3 ${textColor}`}>
                                I'm a..
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {['fresher', 'employer'].map((role) => (
                                    <motion.button
                                        key={role}
                                        type="button"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setFormData(prev => ({ ...prev, role }))}
                                        className={`p-1 rounded-lg border-2 transition-all duration-300 text-xs ${
                                            formData.role === role
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                                                : `${inputBg} ${textColor} border-gray-300`
                                        }`}
                                    >
                                        <div className="text-sm font-semibold capitalize">{role}</div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );

            case 2:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className={`block text-sm font-semibold mb-3 ${textColor}`}>
                                Email Address
                            </label>
                            <div className="relative">
                                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center ${subTextColor}`}>
                                    <motion.div whileHover={{ scale: 1.2 }}>
                                        <Mail className="w-5 h-5" />
                                    </motion.div>
                                </div>
                                <motion.input
                                    whileFocus={{ scale: 1.02 }}
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-3 py-1 rounded-lg border ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 text-sm`}
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                            <AnimatePresence>
                                {errors.email && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-2 text-sm text-red-500 flex items-center gap-2"
                                    >
                                        <Shield className="w-4 h-4" />
                                        {errors.email}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        <div>
                            <label className={`block text-sm font-semibold mb-3 ${textColor}`}>
                                Phone Number
                            </label>
                            <div className="relative">
                                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center ${subTextColor}`}>
                                    <motion.div whileHover={{ scale: 1.2 }}>
                                        <Phone className="w-5 h-5" />
                                    </motion.div>
                                </div>
                                <motion.input
                                    whileFocus={{ scale: 1.02 }}
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-3 py-1 rounded-lg border ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 text-sm`}
                                    placeholder="+1 (555) 123-4567"
                                    required
                                />
                            </div>
                            <AnimatePresence>
                                {errors.phone && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-2 text-sm text-red-500 flex items-center gap-2"
                                    >
                                        <Shield className="w-4 h-4" />
                                        {errors.phone}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                );

            case 3:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className={`block text-sm font-semibold mb-3 ${textColor}`}>
                                Company <span className={`text-xs ${subTextColor}`}>(Optional)</span>
                            </label>
                            <div className="relative">
                                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center ${subTextColor}`}>
                                    <motion.div whileHover={{ scale: 1.2 }}>
                                        <Building2 className="w-5 h-5" />
                                    </motion.div>
                                </div>
                                <motion.input
                                    whileFocus={{ scale: 1.02 }}
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-3 py-1 rounded-lg border ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 text-sm`}
                                    placeholder="Current company (optional)"
                                />
                            </div>
                            <AnimatePresence>
                                {errors.company && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-2 text-sm text-red-500 flex items-center gap-2"
                                    >
                                        <Shield className="w-4 h-4" />
                                        {errors.company}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        
                        <div>
                            <label className={`block text-sm font-semibold mb-3 ${textColor}`}>
                                Location
                            </label>
                            <div className="relative">
                                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center ${subTextColor}`}>
                                    <motion.div whileHover={{ scale: 1.2 }}>
                                        <MapPin className="w-5 h-5" />
                                    </motion.div>
                                </div>
                                <motion.input
                                    whileFocus={{ scale: 1.02 }}
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-3 py-1 rounded-lg border ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 text-sm`}
                                    placeholder="City, Country"
                                    required
                                />
                            </div>
                            <AnimatePresence>
                                {errors.location && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-2 text-sm text-red-500 flex items-center gap-2"
                                    >
                                        <Shield className="w-4 h-4" />
                                        {errors.location}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                );

            case 4:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className={`block text-sm font-semibold mb-3 ${textColor}`}>
                                Password
                            </label>
                            <div className="relative">
                                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center ${subTextColor}`}>
                                    <motion.div whileHover={{ scale: 1.2 }}>
                                        <Lock className="w-5 h-5" />
                                    </motion.div>
                                </div>
                                <motion.input
                                    whileFocus={{ scale: 1.02 }}
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-10 py-1 rounded-lg border ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 text-sm`}
                                    placeholder="Create a strong password"
                                    required
                                />
                                <motion.button
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${subTextColor} hover:text-blue-500 transition-colors`}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </motion.button>
                            </div>
                            <AnimatePresence>
                                {errors.password && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-2 text-sm text-red-500 flex items-center gap-2"
                                    >
                                        <Shield className="w-4 h-4" />
                                        {errors.password}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        <div>
                            <label className={`block text-sm font-semibold mb-3 ${textColor}`}>
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center ${subTextColor}`}>
                                    <motion.div whileHover={{ scale: 1.2 }}>
                                        <Lock className="w-5 h-5" />
                                    </motion.div>
                                </div>
                                <motion.input
                                    whileFocus={{ scale: 1.02 }}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-10 py-1 rounded-lg border ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 text-sm`}
                                    placeholder="Confirm your password"
                                    required
                                />
                                <motion.button
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${subTextColor} hover:text-blue-500 transition-colors`}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </motion.button>
                            </div>
                            <AnimatePresence>
                                {errors.password_confirmation && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-2 text-sm text-red-500 flex items-center gap-2"
                                    >
                                        <Shield className="w-4 h-4" />
                                        {errors.password_confirmation}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                );

            case 5:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="text-center">
                            <motion.div 
                                whileHover={{ scale: 1.1 }}
                                className={`w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-2xl`}
                            >
                                <CheckCircle className="w-10 h-10" />
                            </motion.div>
                            <h3 className={`text-2xl font-bold ${textColor} mb-2`}>Verify Your Email</h3>
                            <p className={`text-base ${subTextColor} mb-6`}>
                                We've sent a verification code to your email address. Please enter it below to complete your registration.
                            </p>
                        </div>

                        <div>
                            <label className={`block text-sm font-semibold mb-3 ${textColor}`}>
                                Verification Code
                            </label>
                            <div className="relative">
                                <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center ${subTextColor}`}>
                                    <motion.div whileHover={{ scale: 1.2 }}>
                                        <CheckCircle className="w-4 h-4" />
                                    </motion.div>
                                </div>
                                <motion.input
                                    whileFocus={{ scale: 1.02 }}
                                    type="text"
                                    name="verification_code"
                                    value={formData.verification_code}
                                    onChange={handleInputChange}
                                    onKeyPress={(e) => {
                                        if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    className={`w-full pl-10 pr-3 py-1 rounded-lg border ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 text-sm`}
                                    placeholder="Enter 6-digit code"
                                    maxLength="6"
                                    pattern="[0-9]{6}"
                                    inputMode="numeric"
                                    required
                                />
                            </div>
                            <AnimatePresence>
                                {errors.verification_code && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-2 text-sm text-red-500 flex items-center gap-2"
                                    >
                                        <Shield className="w-4 h-4" />
                                        {errors.verification_code}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => {
                                    // Resend verification code logic
                                    console.log('Resend verification code');
                                }}
                                className={`text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors`}
                            >
                                Resend Code
                            </button>
                            <div className={`text-sm ${subTextColor}`}>
                                Didn't receive the code? Check your spam folder.
                            </div>
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    const features = [
        { icon: Rocket, text: 'Launch your career', color: 'text-blue-500' },
        { icon: Users, text: 'Join 50K+ professionals', color: 'text-purple-500' },
        { icon: Briefcase, text: 'Access premium jobs', color: 'text-green-500' },
        { icon: TrendingUp, text: 'Track your progress', color: 'text-orange-500' }
    ];

    
    const closeNotification = () => {
        setShowNotification(false);
    };

    return (
        <>
            <Head title="Create Account - ATS" />
            
            <div className={`min-h-screen flex items-center justify-center ${bgColor} relative overflow-hidden`}>
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-blue-500/20' : 'bg-blue-400/20'}`} />
                    <div className={`absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl ${isDark ? 'bg-purple-500/20' : 'bg-purple-400/20'}`} />
                </div>

                <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid lg:grid-cols-2 gap-12 items-center"
                    >
                        {/* Left Side - Info */}
                        <motion.div
                            variants={itemVariants}
                            className="text-center lg:text-left"
                        >
                            {/* Badge */}
                            <motion.div variants={itemVariants} className="mb-6">
                                <motion.div 
                                    variants={glowVariants}
                                    initial="initial"
                                    animate="animate"
                                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border ${isDark ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-blue-500/30 shadow-lg shadow-blue-500/20' : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 shadow-lg shadow-blue-500/10'}`}
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                    </motion.div>
                                    Join 50K+ Professionals
                                </motion.div>
                            </motion.div>

                            
                            {/* Heading */}
                            <motion.h1
                                variants={itemVariants}
                                className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${textColor}`}
                            >
                                Start Your{' '}
                                <motion.span 
                                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600"
                                    whileHover={{ scale: 1.1 }}
                                >
                                    Career Journey
                                </motion.span>
                            </motion.h1>

                            {/* Subheading */}
                            <motion.p
                                variants={itemVariants}
                                className={`text-lg mb-8 ${subTextColor}`}
                            >
                                Create your account and discover opportunities that match your skills and experience.
                            </motion.p>

                            {/* Features */}
                            <motion.div variants={itemVariants} className="space-y-4">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ x: 10 }}
                                        className="flex items-center gap-4"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.2, rotate: 360 }}
                                            transition={{ duration: 0.3 }}
                                            className={`w-12 h-12 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} flex items-center justify-center shadow-lg`}
                                        >
                                            <feature.icon className={`w-6 h-6 ${feature.color}`} />
                                        </motion.div>
                                        <span className={`text-base font-medium ${textColor}`}>{feature.text}</span>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Sign In Link */}
                            <motion.div variants={itemVariants} className="mt-8">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/50 border border-gray-200'} backdrop-blur-sm`}
                                >
                                    <p className={`text-sm font-medium ${subTextColor}`}>
                                        Already have an account?
                                    </p>
                                    <Link
                                        href={route('login')}
                                        className="text-blue-500 hover:text-blue-600 font-bold transition-colors flex items-center gap-1"
                                    >
                                        Sign in
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {/* Right Side - Form */}
                        <motion.div
                            variants={itemVariants}
                            className="w-full max-w-md mx-auto lg:mx-0"
                        >
                            <motion.div 
                                whileHover={{ y: -5 }}
                                className={`${cardBg} rounded-2xl shadow-2xl border p-6 backdrop-blur-xl relative overflow-hidden`}
                            >
                                {/* Decorative Elements */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-500/20 to-blue-500/20 rounded-full blur-xl" />
                                {/* Form Header */}
                                <div className="text-center mb-4 relative z-10">
                                    <motion.div 
                                        whileHover={{ scale: 1.1, rotate: 360 }}
                                        transition={{ duration: 0.5 }}
                                        className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3 shadow-2xl`}
                                    >
                                        <User className="w-10 h-10" />
                                    </motion.div>
                                    <h2 className={`text-2xl font-bold ${textColor} mb-2`}>Create Account</h2>
                                    <p className={`text-sm ${subTextColor}`}>Join our professional community</p>
                                </div>

                                {/* Step Indicators */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-1">
                                        {steps.map((step, index) => (
                                            <div key={step.number} className="flex items-center flex-1">
                                                <motion.button
                                                    type="button"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleStepClick(step.number)}
                                                    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                        currentStep >= step.number
                                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                                            : `${inputBg} ${subTextColor} border-2 ${isDark ? 'border-gray-600' : 'border-gray-300'}`
                                                    }`}
                                                >
                                                    <step.icon className="w-5 h-5" />
                                                    {currentStep > step.number && (
                                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                            <CheckCircle className="w-3 h-3 text-white" />
                                                        </div>
                                                    )}
                                                </motion.button>
                                                {index < steps.length - 1 && (
                                                    <div className={`flex-1 h-1 mx-2 ${
                                                        currentStep > step.number
                                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                                                            : `${isDark ? 'bg-gray-600' : 'bg-gray-300'}`
                                                    }`} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between">
                                        {steps.map((step) => (
                                            <div key={step.number} className="text-center flex-1">
                                                <div className={`text-sm font-medium ${
                                                    currentStep >= step.number ? 'text-blue-500' : subTextColor
                                                }`}>
                                                    {step.title}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Registration Form */}
                                <form onSubmit={handleSubmit} className="space-y-2">
                                    <AnimatePresence mode="wait">
                                        {renderStepContent()}
                                    </AnimatePresence>

                                    {/* Navigation Buttons */}
                                    <div className="flex gap-4 pt-2">
                                        {currentStep > 1 && (
                                            <motion.button
                                                type="button"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handlePrevStep}
                                                className={`flex-1 py-2 px-4 rounded-lg border-2 ${inputBg} ${textColor} font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm`}
                                            >
                                                <ArrowRight className="w-5 h-5 rotate-180" />
                                                Previous
                                            </motion.button>
                                        )}
                                        
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={isLoading}
                                            className={`flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed text-sm`}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                                                    />
                                                    <span>Creating Account...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>{currentStep === totalSteps ? 'Create Account' : 'Next Step'}</span>
                                                    {currentStep < totalSteps && <ArrowRight className="w-5 h-5" />}
                                                    {currentStep === totalSteps && <Zap className="w-5 h-5" />}
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </form>

                                {/* Terms */}
                                <motion.div variants={itemVariants} className="mt-4 text-center">
                                    <p className={`text-sm ${subTextColor} flex items-center justify-center gap-2`}>
                                        
                                        <span>By creating an account, you agree to our</span>
                                    </p>
                                    <div className="flex items-center justify-center gap-2">
                                        <Link 
                                            href="/terms" 
                                            className="text-blue-500 hover:text-blue-600 font-medium transition-colors underline decoration-2 underline-offset-2"
                                        >
                                            Terms of Service
                                        </Link>
                                        <span className={subTextColor}>and</span>
                                        <Link 
                                            href="/privacy" 
                                            className="text-blue-500 hover:text-blue-600 font-medium transition-colors underline decoration-2 underline-offset-2"
                                        >
                                            Privacy Policy
                                        </Link>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Success Notification */}
            <AnimatePresence>
                {showNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.8 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="fixed top-4 right-4 z-50 max-w-sm"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-3">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, duration: 0.2, type: "spring" }}
                                className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center"
                            >
                                <CheckCircle className="w-6 h-6 text-white" />
                            </motion.div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    Success!
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {notificationMessage}
                                </p>
                                <div className="mt-2 flex justify-end">
                                    <button
                                        onClick={closeNotification}
                                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default function Register() {
    return (
        <ThemeProvider>
            <RegisterContent />
        </ThemeProvider>
    );
}
