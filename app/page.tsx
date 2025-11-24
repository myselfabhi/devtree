import Image from "next/image";
import { Profile } from "./types/profile";

const profileData: Profile = {
  name: "Your Name",
  bio: "A short description about yourself",
  avatar: "/avatar.jpg",  // or leave undefined
  links: [
    {
      title: "Portfolio",
      url: "https://yourportfolio.com"
    },
    {
      title: "GitHub",
      url: "https://github.com/myselfabhi"
    },
    {
      title: "Twitter",
      url: "https://twitter.com/_myselfabhi"
    },
    {
      title: "LinkedIn",
      url: "https://linkedin.com/in/yourprofile"
    }
  ]
};

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <div className="w-full max-w-md px-6 py-8">
        {/* Profile Header */}
        <div className="text-center mb-8">
          {/* Avatar - conditional rendering */}
          {profileData.avatar && (
            <Image
              src={profileData.avatar}
              alt={profileData.name}
              width={100}
              height={100}
              className="rounded-full mx-auto mb-4"
            />
          )}
          
          {/* Name */}
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            {profileData.name}
          </h1>
          
          {/* Bio - conditional rendering */}
          {profileData.bio && (
            <p className="text-gray-600 dark:text-gray-400">
              {profileData.bio}
            </p>
          )}
        </div>
        
        {/* Links Section */}
        <div className="space-y-3">
          {profileData.links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {link.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}