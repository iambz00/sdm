'use client';

import  { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";


const resolveRole: { [key: string]: string } = {
  'SYSTEM_ADMIN': '전체 관리',
  'SYSTEM_VIEWER': '전체 조회',
  'REGION_ADMIN': '지역 관리',
  'REGION_VIEWER': '지역 조회',
  'ORG_ADMIN': '관리',
  'ORG_VIEWER': '조회'
}

interface UserProfile {
  name: string;
  role: string;
}

export function AuthButton() {
  const [user, setUser] = useState<any | null>(null); // Supabase user type
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);

      const { data: { user: fetchedUser } } = await supabase.auth.getUser();
      setUser(fetchedUser);

      if (fetchedUser) {
        const { data: fetchedProfile } = await supabase
          .from("profiles")
          .select("name, role")
          .eq("id", fetchedUser.id)
          .single();
        setProfile(fetchedProfile as UserProfile); // Cast to UserProfile
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    fetchUserData();

    // Listen to auth state changes to keep the UI updated
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          fetchUserData(); // Re-fetch user data on sign-in/out
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe(); // Cleanup the subscription
    };
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <div className="h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button asChild size="sm" variant={"outline"}>
          <Link href="/auth/login">로그인</Link>
        </Button>
        <Button asChild size="sm" variant={"default"}>
          <Link href="/auth/sign-up">등록</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="font-medium">{profile?.name || user.email}</span>
        <Badge variant="outline" className="text-primary rounded-sm">
          {resolveRole[profile?.role || ''] || ''}
        </Badge>
      </div>
    </div>
  );
}
