import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  get,
  remove
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDREDpiCTsrljt-gZTNQMXoyqiM7JGM8bQ",
  authDomain: "profile-tracker-aba67.firebaseapp.com",
  projectId: "profile-tracker-aba67",
  storageBucket: "profile-tracker-aba67.firebasestorage.app",
  messagingSenderId: "300333519127",
  appId: "1:300333519127:web:a9e61d0b4b25f52daa6752"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const steps = [
  "ATT",
  "NGÂM TK TRẮNG 3H SAU ĐÓ HUỆY",
  "HUỆY TK XONG NGÂM ĐÓ 9-10 TIẾNG rỒi lên camp",
  "NGÂM CAMP ĐÓ TẦM 12 TIẾNG RỒI LIÊN KẾT PARTNER",
  "TẦM 12 TIẾNG SAU THÌ KÍCH HOẠT TÀI KHOẢN"
];

const formatTime = (date) => date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

export default function ProfileStepTracker() {
  const [profileName, setProfileName] = useState("");
  const [editedProfileName, setEditedProfileName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [profiles, setProfiles] = useState({});
  const [currentProfile, setCurrentProfile] = useState(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      const snapshot = await get(ref(db, "profiles"));
      if (snapshot.exists()) {
        setProfiles(snapshot.val());
      }
    };
    fetchProfiles();
  }, []);

  const saveProfiles = (newProfiles) => {
    setProfiles(newProfiles);
    set(ref(db, "profiles"), newProfiles);
  };

  const handleCreateProfile = () => {
    if (!profileName) return;
    const newProfiles = { ...profiles, [profileName]: Array(5).fill(null) };
    saveProfiles(newProfiles);
    setCurrentProfile(profileName);
    setEditedProfileName(profileName);
    setIsEditingName(false);
  };

  const handleClickStep = (index) => {
    if (!currentProfile) return;
    const updatedSteps = [...profiles[currentProfile]];
    if (!updatedSteps[index]) {
      updatedSteps[index] = new Date().toISOString();
      const newProfiles = { ...profiles, [currentProfile]: updatedSteps };
      saveProfiles(newProfiles);
    }
  };

  const handleRenameProfile = () => {
    if (!currentProfile || !editedProfileName.trim()) return;
    if (profiles[editedProfileName]) {
      alert("Tên profile mới đã tồn tại!");
      return;
    }
    const updatedProfiles = { ...profiles };
    updatedProfiles[editedProfileName] = profiles[currentProfile];
    delete updatedProfiles[currentProfile];
    saveProfiles(updatedProfiles);
    setCurrentProfile(editedProfileName);
    setEditedProfileName(editedProfileName);
    setIsEditingName(false);
  };

  const handleDeleteProfile = (name) => {
    if (!window.confirm(`Xoá profile "${name}"?`)) return;
    const updatedProfiles = { ...profiles };
    delete updatedProfiles[name];
    saveProfiles(updatedProfiles);
    if (name === currentProfile) {
      setCurrentProfile(null);
      setEditedProfileName("");
      setIsEditingName(false);
    }
  };

  const handleExportProfile = (name) => {
    const profileData = profiles[name];
    let content = `Tên profile: ${name}\n\n`;
    profileData.forEach((timestamp, index) => {
      const timeStr = timestamp ? formatTime(new Date(timestamp)) : "(chưa thực hiện)";
      content += `Bước ${index + 1}: ${steps[index]}\nThời gian: ${timeStr}\n\n`;
    });
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${name}.txt`;
    link.click();
  };

  const renderTimeDiff = (index) => {
    const stepsData = profiles[currentProfile];
    if (index === 0 || !stepsData[index] || !stepsData[index - 1]) return null;
    const diffMs = new Date(stepsData[index]) - new Date(stepsData[index - 1]);
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return (
      <span className="text-sm text-purple-600 ml-2">
        (cách {hours > 0 ? `${hours} giờ ` : ""}{minutes} phút)
      </span>
    );
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6 font-sans text-gray-800">
      <h1 className="text-2xl font-bold text-blue-700">Trình tự thao tác Profile</h1>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Nhập tên profile"
          className="border border-gray-400 p-2 flex-grow rounded-md"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          onClick={handleCreateProfile}
        >
          Tạo / Chọn
        </button>
      </div>

      {currentProfile && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-semibold text-lg text-green-700">
            <span>Profile:</span>
            {isEditingName ? (
              <>
                <input
                  className="border rounded px-2 py-1 text-base"
                  value={editedProfileName}
                  onChange={(e) => setEditedProfileName(e.target.value)}
                />
                <button
                  onClick={handleRenameProfile}
                  className="text-sm px-3 py-1 bg-yellow-400 hover:bg-yellow-500 rounded text-white"
                >
                  Lưu
                </button>
              </>
            ) : (
              <>
                <span className="text-black text-base">{currentProfile}</span>
                <button
                  onClick={() => {
                    setEditedProfileName(currentProfile);
                    setIsEditingName(true);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  title="Đổi tên profile"
                >
                  ✏️
                </button>
              </>
            )}
          </div>

          {steps.map((step, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-3 items-center border-b pb-2 mb-2"
            >
              <button
                disabled={!!profiles[currentProfile][index]}
                className={`col-span-1 px-3 py-2 rounded-md text-sm ${
                  profiles[currentProfile][index]
                    ? "bg-green-200 text-green-800 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => handleClickStep(index)}
              >
                Bước {index + 1}
              </button>

              <span className="col-span-6">{step}</span>

              <div className="col-span-5 text-xs text-right">
                {profiles[currentProfile][index] && (
                  <div className="text-gray-600">
                    {formatTime(new Date(profiles[currentProfile][index]))}
                  </div>
                )}
                {renderTimeDiff(index)}
              </div>
            </div>
          ))}

          <button
            onClick={() => handleExportProfile(currentProfile)}
            className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm border"
          >
            Xuất file TXT
          </button>
        </div>
      )}

      {Object.keys(profiles).length > 0 && (
        <div>
          <h3 className="mt-6 font-semibold text-base">Chọn profile đã tạo:</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.keys(profiles).map((name) => (
              <div key={name} className="flex items-center gap-2">
                <button
                  className={`px-3 py-1 border rounded-md text-sm ${
                    currentProfile === name ? "bg-blue-100" : "bg-gray-100"
                  }`}
                  onClick={() => {
                    setCurrentProfile(name);
                    setEditedProfileName(name);
                    setIsEditingName(false);
                  }}
                >
                  {name}
                </button>
                <button
                  onClick={() => handleDeleteProfile(name)}
                  className="text-red-500 hover:text-red-700 text-xs"
                  title="Xoá profile"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
