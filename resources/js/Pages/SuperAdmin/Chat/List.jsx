import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "../Layouts/AuthenticatedLayout";


import React, { useState } from "react";
import {
    FiSearch,
    FiMessageCircle,
    FiPhone,
    FiUsers,
    FiBell,
    FiVideo,
    FiPlus,
    FiChevronDown,
    FiMoreHorizontal,
    FiSmile,
    FiPaperclip,
    FiMic,
    FiImage,
    FiEye,
    FiMonitor,
    FiPhoneCall,
    FiUserPlus,
} from "react-icons/fi";
import { BsDot } from "react-icons/bs";
import { TbDialpad } from "react-icons/tb";

const chatUsers = [
    {
        id: "1",
        name: "Louis Litt",
        avatar: "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740",
        lastMessage: "You just got LITT up, Mike.",
        timestamp: "9:51 AM",
        isOnline: true,
    },
    {
        id: "2",
        name: "Harvey Specter",
        avatar: "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740",
        lastMessage: "Wrong. You take the gun...",
        timestamp: "4:32 PM",
        isOnline: true,
    },
    {
        id: "3",
        name: "Rachel Zane",
        avatar: "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740",
        lastMessage: "I was thinking that we could...",
        timestamp: "Wed",
        isOnline: true,
    },
    {
        id: "4",
        name: "Donna Paulsen",
        avatar: "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740",
        lastMessage: "Mike, I know everything!",
        timestamp: "Tue",
        isOnline: false,
    },
    {
        id: "5",
        name: "Jessica Pearson",
        avatar: "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740",
        lastMessage: "Have you finished the draft...",
        timestamp: "9/3/2020",
        isOnline: false,
    },
];

const messages = [
    {
        id: "1",
        sender: "harvey",
        content: "Hi, harvey where are you now a days?",
        timestamp: "2:35 PM",
    },
    {
        id: "2",
        sender: "harvey",
        content: "okk, what about admin template?",
        timestamp: "2:48 PM",
    },
    {
        id: "3",
        sender: "you",
        content: "I am in USA",
        timestamp: "2:37 PM",
    },
    {
        id: "4",
        sender: "you",
        content: "I have already purchased the admin template",
        timestamp: "2:49 PM",
    },
    {
        id: "5",
        sender: "harvey",
        content: "ohhk, great, which admin template you have purchased?",
        timestamp: "3:12 PM",
    },
];

export default function List() {
    const [showDropdown, setShowDropdown] = useState(false)
    const [showUserDropdown, setShowUserDropdown] = useState(false)
    const [message, setMessage] = useState("")
    const [selectedUser, setSelectedUser] = useState(null);
    return (
        <AuthenticatedLayout>
            <Head title="Manage Tables" />

            <div className="mt-[64px] relative w-full">
                <div className="absolute w-full top-0 right-0" >
                    <div className="flex h-[95vh] bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white">
                        {/* Left Sidebar */}
                        <div className="w-80 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col">
                            {/* User Profile Header */}
                            <div className="px-3 py-2 ">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <img src="https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740" alt="Rachel Zane" width={40} height={40} className="rounded-full" />
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                                        </div>
                                        <span className="font-medium">Rachel Zane</span>
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowUserDropdown(!showUserDropdown)}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                                        >
                                            <FiMoreHorizontal className="w-5 h-5" />
                                        </button>
                                        {showUserDropdown && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 z-10">
                                                <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                                                    Settings
                                                </button>
                                                <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                                                    Sign Out
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="p-2">
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="People, groups, & messages"
                                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                        <TbDialpad className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex border-b border-gray-200 dark:border-slate-700">
                                <button className="group flex-1 flex flex-col items-center py-2 relative transition-all duration-300">
                                    <FiMessageCircle className="w-4 h-4 mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 group-hover:scale-110 transition-transform duration-300" />
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Chats</span>

                                    {/* Animated underline */}
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-1/2 transition-all duration-300 rounded-full"></span>
                                </button>

                                <button className="flex-1 flex flex-col items-center py-2 text-gray-500 hover:text-gray-700 dark:hover:text-blue-500 transition-colors">
                                    <FiPhone className="w-5 h-5 mb-1" />
                                    <span className="text-xs">Calls</span>
                                </button>
                                <button className="flex-1 flex flex-col items-center py-2 text-gray-500 hover:text-gray-700 dark:hover:text-blue-500 transition-colors">
                                    <FiUsers className="w-5 h-5 mb-1" />
                                    <span className="text-xs">Contacts</span>
                                </button>
                                <button className="flex-1 flex flex-col items-center py-2 text-gray-500 hover:text-gray-700 dark:hover:text-blue-500 transition-colors">
                                    <FiBell className="w-5 h-5 mb-1" />
                                    <span className="text-xs">Notifications</span>
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="p-4 space-y-2 ">
                                <div className="relative ">
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="w-full flex items-center px-4 py-2  justify-between bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <FiVideo className="w-4 h-4" />
                                            <span>Meet Now</span>
                                        </div>
                                        <FiChevronDown className="w-4 h-4" />
                                    </button>
                                    {showDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 z-10">
                                            <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                                                Start Video Call
                                            </button>
                                            <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                                                Start Audio Call
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <button className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    <div className="flex items-center space-x-2">
                                        <FiPlus className="w-4 h-4" />
                                        <span>New Chat</span>
                                    </div>
                                    <FiChevronDown className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Recent Chats */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="px-4 py-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                            Recent Chats
                                        </h3>
                                        <FiChevronDown className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div className="space-y-1">
                                        {chatUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={user.avatar || "/placeholder.svg"}
                                                        alt={user.name}
                                                        width={40}
                                                        height={40}
                                                        className="rounded-full"
                                                    />
                                                    {user.isOnline && (
                                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium truncate">{user.name}</p>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">{user.timestamp}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.lastMessage}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Chat Area */}
                        <div className="flex-1 flex flex-col">
                            {/* Chat Header */}
                            <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-2 py-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <h1 className="text-xl font-semibold">Harvey Inspector</h1>
                                        <div className="flex items-center space-x-4 text-sm">
                                            <div className="flex items-center space-x-1 text-green-500">
                                                <BsDot className="w-4 h-4" />
                                                <span>Active Now</span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">
                                                <FiImage className="w-4 h-4" />
                                                <span>Gallery</span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors">
                                                <FiEye className="w-4 h-4" />
                                                <span>Find</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                            <FiMonitor className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                            <FiPhoneCall className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                            <FiUserPlus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.sender === "you" ? "justify-end" : "justify-start"}`}>
                                        <div
                                            className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${msg.sender === "you" ? "flex-row-reverse space-x-reverse" : ""}`}
                                        >
                                            {msg.sender === "harvey" && (
                                                <img src="https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740" alt="Harvey" width={32} height={32} className="rounded-full" />
                                            )}
                                            <div className="flex flex-col">
                                                <div
                                                    className={`px-4 py-2 rounded-2xl ${msg.sender === "you"
                                                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                                                        : "bg-blue-500 text-white"
                                                        } hover:shadow-lg transition-shadow`}
                                                >
                                                    <p className="text-sm">{msg.content}</p>
                                                </div>
                                                <div
                                                    className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${msg.sender === "you" ? "text-right" : "text-left"}`}
                                                >
                                                    {msg.sender === "harvey" ? "Harvey, " : "you, "}
                                                    {msg.timestamp}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Message Input */}
                            <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-4">
                                <div className="flex items-center space-x-4">
                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                        <FiSmile className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </button>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Type a message"
                                            className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>
                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                        <FiPaperclip className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                        <FiMic className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                        <FiMoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}