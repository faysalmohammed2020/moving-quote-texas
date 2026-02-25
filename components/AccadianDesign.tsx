// "use client";

// import React, { useState } from "react";
// import { postdata } from "@/app/data/postdata";

// const Accordion: React.FC = () => {
//   const [expandedState, setExpandedState] = useState<string | null>(null);

//   const toggleAccordion = (state: string) => {
//     setExpandedState((prev) => (prev === state ? null : state));
//   };

//   return (
//     <div className="container mx-auto px-4 py-10">
//       <h1 className="text-4xl font-bold text-center text-blue-900 mb-8">
//         Your Moveing Planning Here
//       </h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {states.map((state) => {
//           const statePosts = postdata.filter(
//             (post) => post.post_category === state.name
//           );

//           return (
//             <div
//               key={state.id}
//               className="border rounded-lg shadow-md overflow-hidden"
//             >
//               <div
//                 className="p-4 flex justify-between items-center cursor-pointer bg-white"
//                 onClick={() => toggleAccordion(state.name)}
//               >
//                 <h2 className="text-xl font-semibold text-blue-900">
//                   {state.name}
//                 </h2>
//                 <span className="text-gray-600">
//                   {expandedState === state.name ? "▲" : "▼"}
//                 </span>
//               </div>
//               <div
//                 className={`transition-all duration-300 ${
//                   expandedState === state.name
//                     ? "max-h-screen p-4 bg-gray-50"
//                     : "max-h-0 overflow-hidden"
//                 }`}
//               >
//                 {expandedState === state.name && (
//                   <ul className="space-y-2">
//                     {statePosts.slice(0, 10).map((post) => (
//                       <li
//                         key={post.ID}
//                         className="text-blue-600 hover:underline"
//                       >
//                         <a href={`/blog/${post.ID}`}>{post.post_title}</a>
//                       </li>
//                     ))}
//                     {statePosts.length === 0 && (
//                       <p className="text-gray-600">No posts available.</p>
//                     )}
//                   </ul>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default Accordion;
