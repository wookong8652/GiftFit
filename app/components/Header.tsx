"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 로그인 사용자 확인
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    };

    getUser();

    // 로그인 / 로그아웃 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 로그아웃
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* 로고 */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-gray-900"
        >
          GiftFit
        </Link>

        {/* 오른쪽 메뉴 */}
        <nav className="flex items-center gap-5">

          {/* 로그인 상태 확인 중 */}
          {loading ? null : user ? (
            <>
              {/* 장바구니 */}
              <Link
                href="/cart"
                className="text-sm font-medium text-gray-700 hover:text-black"
              >
                🛒 장바구니
              </Link>

              {/* 마이페이지 */}
              <Link
                href="/mypage"
                className="text-sm font-medium text-gray-700 hover:text-black"
              >
                마이페이지
              </Link>

              {/* 주문내역 */}
              <Link
                href="/orders"
                className="text-sm font-medium text-gray-700 hover:text-black"
              >
                주문내역
              </Link>

              {/* AI 선물 추천 */}
              <Link
                href="/recommend"
                className="text-sm font-medium text-gray-700 hover:text-black"
              >
                🎁 AI 선물 추천
              </Link>

              {/* 이메일 */}
              <span className="text-sm text-gray-500">
                {user.email}
              </span>

              {/* 로그아웃 */}
              <button
                onClick={handleLogout}
                className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              {/* 로그인 */}
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-black"
              >
                로그인
              </Link>

              {/* 회원가입 */}
              <Link
                href="/signup"
                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}