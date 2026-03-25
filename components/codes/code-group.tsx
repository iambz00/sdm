"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface CodeGroupSelectProps {
  value: string;
  onChange: (value: string) => void;
  showAllOption?: boolean; // "전체 보기" 옵션 표시 여부
  includeGroupOption?: boolean; // "최상위 그룹 정의 (GROUP)" 옵션 표시 여부
  className?: string;
  disabled?: boolean;
}

export default function CodeGroupSelect({
  value,
  onChange,
  showAllOption = false,
  includeGroupOption = false,
  className = "",
  disabled = false,
}: CodeGroupSelectProps) {
  const [groupOptions, setGroupOptions] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase
        .from("codes")
        .select("code, name")
        .eq("group_code", "GROUP")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (!error && data) {
        setGroupOptions(data);
      }
    };

    fetchGroups();
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`p-2 border rounded bg-white disabled:bg-gray-100 ${className}`}
    >
      {showAllOption && <option value="all">전체 보기</option>}
      {!showAllOption && <option value="" disabled>그룹을 선택하세요</option>}
      {includeGroupOption && <option value="GROUP">최상위 그룹 정의 (GROUP)</option>}
      
      {groupOptions.map((group) => (
        <option key={group.code} value={group.code}>
          {group.name} {showAllOption ? `(${group.code})` : ""}
        </option>
      ))}
    </select>
  );
}
