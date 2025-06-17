import React, { useState } from "react";

const steps = [
  "ATT",
  "NGÂM TK TRẮNG 3H SAU ĐÓ HUỶ",
  "HUỶ TK XONG NGÂM ĐÓ 9-10 TIẾNG rồi lên camp",
  "NGÂM CAMP ĐÓ TẦM 12 TIẾNG RỒI LIÊN KẾT PARTNER",
  "TẦM 12 TIẾNG SAU THÌ KÍCH HOẠT TÀI KHOẢN"
];

const formatTime = (date) => date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

export default function ProfileStepTracker() {
  const [profileName, setProfileName] = useState("");
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem("profiles");
    return saved ? JSON.parse(saved) : {};
  });

  const [currentProfile, setCurrentProfile] = useState(null);

  const handleCreateProfile = () => {
    if (!profileName) return;
    const newProfiles = { ...profiles, [profileName]: Array(5).fill(null) };
    setProfiles(newProfiles);
    localStorage.setItem("profiles", JSON.stringify(newProfiles));
    setCurrentProfile(profileName);
  };

  const handleClickStep = (index) => {
    if (!currentProfile) return;
    const updatedSteps = [...profiles[currentProfile]];
    if (!updatedSteps[index]) {
      updatedSteps[index] = new Date().toISOString();
      const newProfiles = { ...profiles, [currentProfile]: updatedSteps };
      setProfiles(newProfiles);
      localStorage.setItem("profiles", JSON.stringify(newProfiles));
    }
  };

  const renderTimeDiff = (index) => {
    const stepsData = profiles[currentProfile];
    if (index === 0 || !stepsData[index] || !stepsData[index - 1]) return null;
    const diff =
      (new Date(stepsData[index]) - new Date(stepsData[index - 1])) / 3600000;
    return <span className="ml-2 text-sm text-blue-600">(+{diff.toFixed(2)}h)</span>;
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Trình tự thao tác Profile</h1>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nhập tên profile"
          className="border p-2 flex-grow rounded"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleCreateProfile}>
          Tạo / Chọn
        </button>
      </div>

      {currentProfile && (
        <div className="space-y-3">
          <h2 className="font-semibold">Profile: {currentProfile}</h2>
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-4">
              <button
                className={\`px-3 py-2 rounded border \${profiles[currentProfile][index] ? "bg-green-200" : "bg-gray-200"}\`}
                onClick={() => handleClickStep(index)}
              >
                Bước {index + 1}
              </button>
              <span>{step}</span>
              {profiles[currentProfile][index] && (
                <span className="text-sm text-gray-700">
                  {formatTime(new Date(profiles[currentProfile][index]))}
                </span>
              )}
              {renderTimeDiff(index)}
            </div>
          ))}
        </div>
      )}

      {Object.keys(profiles).length > 0 && (
        <div>
          <h3 className="mt-6 font-semibold">Chọn profile đã tạo:</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.keys(profiles).map((name) => (
              <button
                key={name}
                className={\`px-3 py-1 border rounded \${currentProfile === name ? "bg-blue-100" : "bg-gray-100"}\`}
                onClick={() => setCurrentProfile(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
