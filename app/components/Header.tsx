"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 현재 로그인 상태 확인
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    };

    getUser();

    // 로그인 / 로그아웃 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 로그아웃
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* =========================
            로고
        ========================== */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-gray-900"
        >
          GiftFit
        </Link>

        {/* =========================
            오른쪽 메뉴
        ========================== */}
        <nav className="flex items-center gap-2">

          {/* 로그인 확인 중에는 메뉴 잠깐 숨김 */}
          {!loading && (
            <>
              {/* =========================
                  로그인 상태
              ========================== */}
              {user ? (
                <>
                  {/* 장바구니
                      로그인한 경우에만 표시 */}
                  <Link
                    href="/cart"
                    className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    🛒 장바구니
                  </Link>

                  {/* 사용자 이메일 */}
                  <span className="hidden max-w-[180px] truncate px-2 text-sm text-gray-500 md:block">
                    {user.email}
                  </span>

                  {/* 로그아웃 */}
                  <button
                    onClick={handleLogout}
                    className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                /* =========================
                   로그아웃 상태
                ========================== */
                <>
                  <Link
                    href="/login"
                    className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    로그인
                  </Link>

                  <Link
                    href="/signup"
                    className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </>
          )}

        </nav>

      </div>

    </header>
  );
}