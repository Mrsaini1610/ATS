import{e as o,j as e,H as u,L as h}from"./app-DBeRPDgO.js";import{G as p}from"./GuestLayout-D3ofVSGz.js";import{l as f,c as b,v as w,j,d as y}from"./index-DInFP_1O.js";import"./Alerts-rJdwX8dL.js";import"./index-5x9mb7g-.js";import"./ApplicationLogo-BflX5MN7.js";import"./index-CfihMCgg.js";import"./iconBase-B4rgEhsF.js";import"./index-3euY7hpd.js";function F({auth:d,laravelVersion:l,phpVersion:c}){const[r,m]=o.useState({days:0,hours:0,minutes:0,seconds:0}),x=o.useMemo(()=>{const t=new Date;return t.setDate(t.getDate()+60),t.setHours(0,0,0,0),t.getTime()},[]);o.useEffect(()=>{const t=()=>{const s=new Date().getTime(),a=x-s;return a<0?{days:0,hours:0,minutes:0,seconds:0}:{days:Math.floor(a/864e5),hours:Math.floor(a%864e5/36e5),minutes:Math.floor(a%36e5/6e4),seconds:Math.floor(a%6e4/1e3)}};m(t());const n=setInterval(()=>{m(t())},1e3);return()=>clearInterval(n)},[x]);const g=[{icon:b,title:"Analytics Dashboard",description:"Real-time recruitment metrics and insights"},{icon:w,title:"Candidate Management",description:"Streamlined applicant tracking and filtering"},{icon:j,title:"Automated Screening",description:"AI-powered resume parsing and evaluation"},{icon:y,title:"Interview Scheduling",description:"Smart calendar integration and reminders"}];return e.jsxs(p,{children:[e.jsx(u,{title:"ATS - Coming Soon"}),e.jsx("div",{className:"min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",children:e.jsxs("div",{className:"container mx-auto px-4 py-16",children:[e.jsxs("div",{className:"mb-12 text-center",children:[e.jsx("h1",{className:"text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400",children:"ATS"}),e.jsx("p",{className:"mt-2 text-gray-600 dark:text-gray-400",children:"Applicant Tracking System"})]}),e.jsxs("div",{className:"mx-auto max-w-4xl text-center",children:[e.jsx("div",{className:"mb-8",children:e.jsx("span",{className:"inline-block rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",children:"Coming Soon"})}),e.jsx("h2",{className:"mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl lg:text-6xl",children:"Revolutionizing Recruitment"}),e.jsx("p",{className:"mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300",children:"The next-generation platform for seamless talent acquisition, candidate management, and data-driven hiring decisions."}),e.jsx("div",{className:"mb-12",children:e.jsxs("div",{className:"grid grid-cols-2 gap-4 md:grid-cols-4",children:[e.jsx(i,{value:r.days,label:"Days"}),e.jsx(i,{value:r.hours,label:"Hours"}),e.jsx(i,{value:r.minutes,label:"Minutes"}),e.jsx(i,{value:r.seconds,label:"Seconds"})]})}),e.jsxs("div",{className:"mx-auto mb-12 max-w-md",children:[e.jsxs("div",{className:"flex gap-2",children:[e.jsx("input",{type:"email",placeholder:"Enter your email for early access",className:"flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"}),e.jsx("button",{className:"rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",children:"Notify Me"})]}),e.jsx("p",{className:"mt-2 text-sm text-gray-500 dark:text-gray-400",children:"Be the first to know when we launch. No spam, ever."})]}),e.jsx("div",{className:"text-center mt-8",children:e.jsxs(h,{href:route("homepage"),className:"inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors",children:[e.jsx(f,{className:"w-5 h-5"}),"View Homepage"]})})]}),e.jsxs("div",{className:"mt-20",children:[e.jsx("h3",{className:"mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white",children:"What to Expect"}),e.jsx("div",{className:"grid gap-8 md:grid-cols-2 lg:grid-cols-4",children:g.map((t,n)=>{const s=t.icon;return e.jsxs("div",{className:"rounded-xl bg-white p-6 text-center shadow-lg transition transform hover:-translate-y-1 dark:bg-gray-800",children:[e.jsx("div",{className:"mb-4 inline-block rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/30",children:e.jsx(s,{className:"h-6 w-6 text-indigo-600 dark:text-indigo-400"})}),e.jsx("h4",{className:"mb-2 text-xl font-semibold text-gray-900 dark:text-white",children:t.title}),e.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:t.description})]},n)})})]}),e.jsx("div",{className:"mt-20 border-t border-gray-200 pt-8 text-center dark:border-gray-700",children:e.jsxs("p",{className:"text-gray-600 dark:text-gray-400",children:["© ",new Date().getFullYear()," ATS. All rights reserved."]})})]})})]})}const i=({value:d,label:l})=>{const c=String(Math.floor(d)).padStart(2,"0");return e.jsxs("div",{className:"countdown-box",children:[e.jsx("div",{className:"countdown-value",children:c}),e.jsx("div",{className:"countdown-label",children:l}),e.jsx("style",{jsx:!0,children:`
                .countdown-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .countdown-value {
                    background: linear-gradient(145deg, #1e1a4b 0%, #2d2a5e 100%);
                    border-radius: 16px;
                    padding: 1rem 0.5rem;
                    min-width: 100px;
                    text-align: center;
                    font-size: 3rem;
                    font-weight: 800;
                    color: white;
                    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.2);
                    letter-spacing: 0.1em;
                }

                @media (min-width: 640px) {
                    .countdown-value {
                        min-width: 120px;
                        font-size: 3.5rem;
                        padding: 1.25rem 0.75rem;
                    }
                }

                @media (min-width: 768px) {
                    .countdown-value {
                        min-width: 140px;
                        font-size: 4rem;
                        padding: 1.5rem 1rem;
                    }
                }

                .countdown-label {
                    margin-top: 1rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    color: #6b7280;
                    text-align: center;
                }

                @media (min-width: 640px) {
                    .countdown-label {
                        font-size: 0.875rem;
                        margin-top: 1.25rem;
                    }
                }

                @media (min-width: 768px) {
                    .countdown-label {
                        font-size: 1rem;
                        margin-top: 1.5rem;
                    }
                }

                .dark .countdown-label {
                    color: #9ca3af;
                }
            `})]})};export{F as default};
