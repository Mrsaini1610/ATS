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
    ArrowRight,
    CheckCircle,
    Sparkles,
    Shield,
    Rocket,
    Users,
    Briefcase,
    TrendingUp,
    X
} from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const glowVariants = {
    initial: { scale: 1, opacity: 0.5 },
    animate: {
        scale: [1, 1.1, 1],
        opacity: [0.5, 0.8, 0.5],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

function UserLoginContent() {
    const { theme, isDark } = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false
    });

    const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const subTextColor = isDark ? 'text-gray-400' : 'text-gray-600';
    const inputBg = isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300';

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        // Simulate API call (frontend only)
        setTimeout(() => {
            console.log('Login data:', formData);
            setNotificationMessage('Login successful! Welcome back to our professional community!');
            setShowNotification(true);
            setIsLoading(false);

            // Redirect to homepage after 3 seconds
            setTimeout(() => {
                window.location.href = route('homepage');
            }, 3000);
        }, 2000);
    };

    const closeNotification = () => {
        setShowNotification(false);
    };

    const features = [
        { icon: Rocket, text: 'Launch your career', color: 'text-blue-500' },
        { icon: Users, text: 'Join 50K+ professionals', color: 'text-purple-500' },
        { icon: Briefcase, text: 'Access premium jobs', color: 'text-green-500' },
        { icon: TrendingUp, text: 'Track your progress', color: 'text-orange-500' }
    ];

    return (
        <>
            <Head title="Sign In - ATS" />

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
                        className="grid lg:grid-cols-2 gap-8 items-center"
                    >
                        {/* Left Side - Info */}
                        <motion.div
                            variants={itemVariants}
                            className="text-center lg:text-left"
                        >
                            {/* Badge */}
                            <motion.div variants={itemVariants} className="mb-4">
                                <motion.div
                                    variants={glowVariants}
                                    initial="initial"
                                    animate="animate"
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border ${isDark ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-blue-500/30 shadow-lg shadow-blue-500/20' : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 shadow-lg shadow-blue-500/10'}`}
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Sparkles className="w-3 h-3" />
                                    </motion.div>
                                    <span className="text-xs">Welcome Back!</span>
                                </motion.div>
                            </motion.div>

                            {/* Heading */}
                            <motion.h1
                                variants={itemVariants}
                                className={`text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4 ${textColor}`}
                            >
                                Sign In to{' '}
                                <motion.span
                                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 font-black"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    Your Account
                                </motion.span>
                            </motion.h1>

                            {/* Subheading */}
                            <motion.p
                                variants={itemVariants}
                                className={`text-base mb-6 font-medium ${subTextColor}`}
                            >
                                Access your account and continue your professional journey.
                            </motion.p>

                            {/* Features */}
                            <motion.div variants={itemVariants} className="space-y-3">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ x: 8, scale: 1.01 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex items-center gap-3 p-2 rounded-lg ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/50 border border-gray-200'} backdrop-blur-sm"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.2, rotate: 360 }}
                                            transition={{ duration: 0.3, type: "spring" }}
                                            className={`flex-shrink-0 w-8 h-8 rounded-lg ${isDark ? 'bg-gradient-to-br from-gray-700 to-gray-800' : 'bg-gradient-to-br from-white to-gray-50'} shadow-lg flex items-center justify-center border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
                                        >
                                            <feature.icon className={`w-4 h-4 ${feature.color}`} />
                                        </motion.div>
                                        <div className="flex-1">
                                            <h3 className={`font-bold text-sm ${textColor} mb-0`}>{feature.text}</h3>
                                            <p className={`text-xs ${subTextColor}`}>Professional opportunities await</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Right Side - Form */}
                        <motion.div
                            variants={itemVariants}
                            className="w-full max-w-md mx-auto lg:mx-0"
                        >
                            <motion.div
                                whileHover={{ y: -5, scale: 1.01 }}
                                transition={{ duration: 0.3 }}
                                className={`${isDark ? 'bg-gray-800/90' : 'bg-white/90'} rounded-2xl shadow-xl border p-6 backdrop-blur-xl relative overflow-hidden`}
                            >
                                {/* Decorative Elements */}
                                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse" />
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-green-500/30 to-blue-500/30 rounded-full blur-2xl animate-pulse" />
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />

                                {/* Form Header */}
                                <div className="text-center mb-6 relative z-10">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 360 }}
                                        transition={{ duration: 0.5, type: "spring" }}
                                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-black mx-auto mb-3 shadow-xl border-2 border-white/20`}
                                    >
                                        <User className="w-8 h-8" />
                                    </motion.div>
                                    <h2 className={`text-2xl font-black ${textColor} mb-2`}>Sign In</h2>
                                    <p className={`text-sm font-medium ${subTextColor}`}>Welcome back to our professional community</p>
                                </div>

                                {/* Login Form */}
                                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">

                                    {/* Email Field */}
                                    <div>
                                        <label className={`block text-xs font-bold mb-1 ${textColor}`}>
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 ${subTextColor}`}
                                            >
                                                <Mail className="w-3 h-3" />
                                            </motion.div>
                                            <motion.input
                                                whileFocus={{ scale: 1.01 }}
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`w-full pl-8 pr-3 py-1.5 rounded-md border ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 text-xs`}
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
                                                    className="mt-1 text-sm text-red-500 flex items-center gap-2"
                                                >
                                                    <Shield className="w-4 h-4" />
                                                    {errors.email}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <label className={`block text-xs font-bold mb-1 ${textColor}`}>
                                            Password
                                        </label>
                                        <div className="relative">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 ${subTextColor}`}
                                            >
                                                <Lock className="w-3 h-3" />
                                            </motion.div>
                                            <motion.input
                                                whileFocus={{ scale: 1.01 }}
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className={`w-full pl-8 pr-8 py-1.5 rounded-md border ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 text-xs`}
                                                placeholder="Enter your password"
                                                required
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${subTextColor} hover:text-blue-500 transition-colors`}
                                            >
                                                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                            </motion.button>
                                        </div>
                                        <AnimatePresence>
                                            {errors.password && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="mt-1 text-sm text-red-500 flex items-center gap-2"
                                                >
                                                    <Shield className="w-4 h-4" />
                                                    {errors.password}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Remember Me & Forgot Password */}
                                    <div className="flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50/50'} backdrop-blur-sm">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                checked={formData.remember}
                                                onChange={handleInputChange}
                                                className={`w-3 h-3 rounded border-gray-400 text-blue-600 focus:ring-blue-500 focus:ring-2`}
                                            />
                                            <span className={`text-xs font-medium ${subTextColor}`}>Remember me</span>
                                        </label>
                                        <Link
                                            href={route('password.request')}
                                            className={`text-xs text-blue-500 hover:text-blue-600 font-bold transition-colors hover:underline`}
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>

                                    {/* Submit Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed text-sm`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                                />
                                                <span>Signing In...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Sign In</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </motion.button>
                                </form>

                                {/* Sign Up Link */}
                                <motion.div variants={itemVariants} className="mt-6 text-center relative z-10">
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50/50 border border-gray-200'} backdrop-blur-sm`}>
                                        <p className={`text-xs font-medium ${subTextColor}`}>
                                            Don't have an account?
                                        </p>
                                        <Link
                                            href={route('register')}
                                            className="text-blue-500 hover:text-blue-600 font-bold transition-colors hover:underline text-sm"
                                        >
                                            Sign Up
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

export default function UserLogin() {
    return (
        <ThemeProvider>
            <UserLoginContent />
        </ThemeProvider>
    );
}
