"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUserEmail(null);
      setIsAdmin(false);
      return;
    }

    setUserEmail(user.email ?? null);

    // 관리자 이메일 확인
    const { data: admin } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    setIsAdmin(!!admin);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        {/* 로고 */}
        <Link
          href="/"
          className="text-2xl font-bold"
        >
          GiftFit
        </Link>

        {/* 메뉴 */}
        <nav className="flex items-center gap-5 text-sm">

          <Link href="/cart">
            🛒 장바구니
          </Link>

          <Link href="/mypage">
            마이페이지
          </Link>

          <Link href="/orders">
            주문내역
          </Link>

          <Link href="/recommend">
            🎁 AI 선물 추천
          </Link>

          {/* 관리자에게만 표시 */}
          {isAdmin && (
            <Link
              href="/admin"
              className="font-bold text-red-600"
            >
              ⚙️ 관리자
            </Link>
          )}

          {userEmail ? (
            <>
              <span className="text-gray-600">
                {userEmail}
              </span>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-gray-100 px-4 py-2"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                로그인
              </Link>

              <Link href="/signup">
                회원가입
              </Link>
            </>
          )}

        </nav>
      </div>
    </header>
  );
}