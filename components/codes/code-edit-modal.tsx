"use client";

import React, { useState, useEffect } from "react";
import CodeGroupSelect from "./code-group";

export interface CodeItem {
  code: string;
  group_code: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface CodeModalProps {
  isOpen: boolean;
  isEditing: boolean;
  initialData: CodeItem;
  onClose: () => void;
  onSubmit: (data: CodeItem) => Promise<void>;
}

export default function CodeModal({ isOpen, isEditing, initialData, onClose, onSubmit }: CodeModalProps) {
  const [formData, setFormData] = useState<CodeItem>(initialData);
  const [loading, setLoading] = useState(false);

  // 모달이 열릴 때 초기 데이터 세팅
  useEffect(() => {
    setFormData(initialData);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGroupChange = (value: string) => {
    setFormData((prev) => ({ ...prev, group_code: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {isEditing ? "공통 코드 수정" : "새 공통 코드 추가"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">그룹 코드</label>
            <CodeGroupSelect
              value={formData.group_code}
              onChange={handleGroupChange}
              includeGroupOption={true}
              disabled={isEditing}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상세 코드</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="예: STS_INUSE_1ON1"
              required
              disabled={isEditing}
              className="w-full p-2 border rounded disabled:bg-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">코드명 (이름)</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="예: 사용중(1인1기기)"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="코드에 대한 설명"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
              사용 여부 (활성화)
            </label>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {loading ? "저장 중..." : isEditing ? "수정 저장" : "추가하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
