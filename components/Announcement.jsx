import React from "react";

const announcements = [
  {
    id: 1,
    title: "System Maintenance",
    date: "2025-10-15",
    description:
      "Scheduled system maintenance on October 15th from 1 AM to 3 AM. Services may be temporarily unavailable.",
  },
  {
    id: 2,
    title: "New Feature Release",
    date: "2025-10-20",
    description:
      "We are excited to announce the release of new features including enhanced reporting and user analytics.",
  },
  {
    id: 3,
    title: "Holiday Schedule",
    date: "2025-12-01",
    description:
      "Please note the holiday schedule for December. Offices will be closed on December 24th and 25th.",
  },
  {
    id: 4,
    title: "Quarterly Review",
    date: "2025-12-15",
    description:
      "Quarterly review meeting to discuss the progress and future plans for the organization.",
  },
  {
    id: 5,
    title: "Employee Training",
    date: "2025-12-20",
    description:
      "Mandatory employee training session on December 20th to cover new policies and procedures.",
  },
];

function Announcement() {
  return (
    <div className="bg-white rounded-md p-4 mt-4 shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">Announcements</h1>
        <span className="text-xs text-gray-400 cursor-pointer hover:underline">
          View All
        </span>
      </div>

      {/* Announcements List */}
      <div className="flex flex-col gap-4">
        {announcements.slice(0, 4).map((announcement) => (
          <div
            key={announcement.id}
            className="p-4 rounded-md shadow-sm odd:bg-purple-200 even:bg-amber-200"
          >
            <h2 className="text-md font-bold text-gray-800">
              {announcement.title}
              <span className="ml-7 text-sm text-gray-500 bg-white rounded-full px-2">
                {announcement.date}
              </span>
            </h2>
            <p className="text-sm text-gray-600 mt-2">{announcement.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Announcement;