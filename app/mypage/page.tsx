"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { products } from "../data/products";
import { supabase } from "../../lib/supabase";

export default function MyPage() {
  const [user, setUser] = useState<any>(null);
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyPage();
  }, []);

  async function loadMyPage() {
    // 현재 로그인한 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setUser(user);

    // 즐겨찾기 가져오기
    const { data, error } = await supabase
      .from("favorites")
      .select("product_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("즐겨찾기 불러오기 오류:", error);
      setLoading(false);
      return;
    }

    // 즐겨찾기한 상품만 찾기
    const myProducts = products.filter((product) =>
      data?.some(
        (favorite) =>
          String(favorite.product_id) === String(product.id)
      )
    );

    setFavoriteProducts(myProducts);
    setLoading(false);
  }

  // 로그아웃
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("로그아웃 오류:", error);
      alert("로그아웃에 실패했습니다.");
      return;
    }

    window.location.href = "/login";
  }

  // 즐겨찾기 삭제
  async function removeFavorite(productId: string | number) {
    if (!user) return;

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) {
      console.error("즐겨찾기 삭제 오류:", error);
      alert("즐겨찾기 삭제에 실패했습니다.");
      return;
    }

    setFavoriteProducts((prev) =>
      prev.filter(
        (product) =>
          String(product.id) !== String(productId)
      )
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          마이페이지를 불러오는 중...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold">
            GiftFit
          </Link>

          <nav className="flex items-center gap-6 text-sm text-gray-600">
            <Link
              href="/"
              className="hover:text-black"
            >
              홈
            </Link>

            <Link
              href="/mypage"
              className="font-semibold text-black"
            >
              마이페이지
            </Link>

            <button
              onClick={handleLogout}
              className="hover:text-black"
            >
              로그아웃
            </button>
          </nav>
        </div>
      </header>

      {/* 마이페이지 */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* 사용자 정보 */}
        <div className="mb-10 rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm text-gray-500">
            안녕하세요 👋
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {user?.email}
          </h1>

          <p className="mt-2 text-gray-500">
            내가 찜한 선물을 확인해보세요.
          </p>
        </div>

        {/* 즐겨찾기 */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            ❤️ 내가 찜한 상품
          </h2>

          <span className="text-sm text-gray-500">
            {favoriteProducts.length}개
          </span>
        </div>

        {/* 상품이 없는 경우 */}
        {favoriteProducts.length === 0 ? (
          <div className="rounded-3xl bg-white py-20 text-center shadow-sm">
            <p className="text-5xl">♡</p>

            <h3 className="mt-5 text-xl font-bold">
              아직 찜한 상품이 없습니다.
            </h3>

            <p className="mt-2 text-gray-500">
              마음에 드는 선물을 찾아보세요.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
            >
              상품 둘러보기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {favoriteProducts.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* 이미지 클릭 */}
                <Link href={`/products/${product.id}`}>
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </Link>

                {/* 상품 정보 */}
                <div className="p-4">
                  <p className="mb-1 text-xs text-gray-500">
                    {product.category}
                  </p>

                  <Link
                    href={`/products/${product.id}`}
                  >
                    <h3 className="min-h-[48px] font-semibold hover:underline">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="mt-3 text-lg font-bold">
                    {product.price.toLocaleString()}원
                  </p>

                  {/* 즐겨찾기 취소 */}
                  <button
                    onClick={() =>
                      removeFavorite(product.id)
                    }
                    className="mt-4 w-full rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    ♥ 찜 해제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}