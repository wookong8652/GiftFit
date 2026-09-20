"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    getUser();
    updateCartCount();

    // 장바구니가 변경됐을 때 개수 업데이트
    const handleCartUpdate = () => {
      updateCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, []);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setEmail(user?.email ?? null);
    setLoading(false);
  }

  function updateCartCount() {
    try {
      const savedCart = localStorage.getItem("giftfit-cart");

      if (!savedCart) {
        setCartCount(0);
        return;
      }

      const cart = JSON.parse(savedCart);

      if (!Array.isArray(cart)) {
        setCartCount(0);
        return;
      }

      // 상품의 quantity를 모두 더함
      const totalCount = cart.reduce(
        (total: number, item: any) => {
          return total + Number(item.quantity || 0);
        },
        0
      );

      setCartCount(totalCount);
    } catch (error) {
      console.error("장바구니 개수 확인 오류:", error);
      setCartCount(0);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("로그아웃에 실패했습니다.");
      return;
    }

    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* 로고 */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight"
        >
          GiftFit
        </Link>

        {/* 메뉴 */}
        <nav className="flex items-center gap-6">

          {/* 홈 */}
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            홈
          </Link>

          {/* AI 선물 추천 */}
          <Link
            href="/recommend"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            AI 선물 추천
          </Link>

          {/* 장바구니 */}
          <Link
            href="/cart"
            className="relative text-sm font-medium text-gray-600 hover:text-black"
          >
            🛒 장바구니

            {cartCount > 0 && (
              <span className="ml-1 inline-flex min-w-[20px] items-center justify-center rounded-full bg-black px-1.5 py-0.5 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* 로그인 상태 */}
          {!loading && (
            <>
              {email ? (
                <>
                  {/* 주문내역 */}
                  <Link
                    href="/orders"
                    className="text-sm font-medium text-gray-600 hover:text-black"
                  >
                    주문내역
                  </Link>

                  {/* 마이페이지 */}
                  <Link
                    href="/mypage"
                    className="text-sm font-medium text-gray-600 hover:text-black"
                  >
                    마이페이지
                  </Link>

                  {/* 이메일 */}
                  <span className="hidden max-w-[180px] truncate text-xs text-gray-400 md:block">
                    {email}
                  </span>

                  {/* 로그아웃 */}
                  <button
                    onClick={handleLogout}
                    className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                /* 로그인 */
                <Link
                  href="/login"
                  className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  로그인
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}