"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { products } from "../../data/products";
import { supabase } from "../../../lib/supabase";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type CartItem = {
  productId: string;
  quantity: number;
};

export default function ProductDetailPage({ params }: PageProps) {
  const [productId, setProductId] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [message, setMessage] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [addingCart, setAddingCart] = useState(false);

  const [product, setProduct] = useState<any>(null);

  // 상품 ID 가져오기
  useEffect(() => {
    params.then((value) => {
      setProductId(value.id);
    });
  }, [params]);

  // 상품 찾기
  useEffect(() => {
    if (!productId) return;

    const foundProduct = products.find(
      (item) => String(item.id) === String(productId)
    );

    setProduct(foundProduct || null);
    setLoading(false);
  }, [productId]);

  // 로그인한 사용자의 즐겨찾기 확인
  useEffect(() => {
    if (!productId) return;

    const checkFavorite = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", String(productId))
        .maybeSingle();

      setIsFavorite(!!data);
    };

    checkFavorite();
  }, [productId]);

  // 즐겨찾기
  const handleFavorite = async () => {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("로그인이 필요합니다.");
      return;
    }

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", String(productId));

      if (error) {
        console.error(error);
        setMessage("즐겨찾기 삭제에 실패했습니다.");
        return;
      }

      setIsFavorite(false);
      setMessage("즐겨찾기에서 삭제했습니다.");
    } else {
      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        product_id: String(productId),
      });

      if (error) {
        console.error(error);
        setMessage("즐겨찾기 추가에 실패했습니다.");
        return;
      }

      setIsFavorite(true);
      setMessage("즐겨찾기에 추가했습니다.");
    }
  };

  // 장바구니 담기
  const handleCart = () => {
    if (!product) return;

    setAddingCart(true);

    const savedCart = localStorage.getItem("giftfit-cart");

    let cart: CartItem[] = [];

    try {
      cart = savedCart ? JSON.parse(savedCart) : [];
    } catch {
      cart = [];
    }

    const existingItem = cart.find(
      (item) => String(item.productId) === String(product.id)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        quantity,
      });
    }

    localStorage.setItem("giftfit-cart", JSON.stringify(cart));

    setMessage("장바구니에 담았습니다.");

    setTimeout(() => {
      setAddingCart(false);
    }, 300);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>상품을 불러오는 중...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">상품을 찾을 수 없습니다.</h1>

        <Link
          href="/"
          className="mt-5 rounded-lg bg-black px-5 py-3 text-white"
        >
          홈으로 돌아가기
        </Link>
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
            <Link href="/">홈</Link>

            <Link href="/mypage">마이페이지</Link>

            <Link
              href="/cart"
              className="font-semibold text-black"
            >
              🛒 장바구니
            </Link>
          </nav>
        </div>
      </header>

      {/* 상품 상세 */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-2">
          {/* 상품 이미지 */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="aspect-square bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* 상품 정보 */}
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-sm text-gray-500">
              {product.category}
            </p>

            <h1 className="text-4xl font-bold leading-tight">
              {product.name}
            </h1>

            <p className="mt-5 text-3xl font-bold">
              {product.price.toLocaleString()}원
            </p>

            {/* 태그 */}
            <div className="mt-5 flex flex-wrap gap-2">
              {product.tags?.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="my-8 h-px bg-gray-200" />

            {/* 수량 */}
            <div className="flex items-center justify-between">
              <span className="font-semibold">수량</span>

              <div className="flex items-center overflow-hidden rounded-xl border bg-white">
                <button
                  onClick={() =>
                    setQuantity((prev) => Math.max(1, prev - 1))
                  }
                  className="px-4 py-3 text-lg hover:bg-gray-100"
                >
                  −
                </button>

                <span className="min-w-12 text-center">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="px-4 py-3 text-lg hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* 총 금액 */}
            <div className="mt-6 flex items-center justify-between">
              <span className="font-semibold">총 상품 금액</span>

              <span className="text-2xl font-bold">
                {(product.price * quantity).toLocaleString()}원
              </span>
            </div>

            {/* 버튼 */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                onClick={handleFavorite}
                className={`rounded-xl border px-5 py-4 font-semibold transition ${
                  isFavorite
                    ? "border-black bg-black text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {isFavorite ? "♥ 찜 완료" : "♡ 찜하기"}
              </button>

              <button
                onClick={handleCart}
                disabled={addingCart}
                className="rounded-xl bg-black px-5 py-4 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                {addingCart ? "담는 중..." : "🛒 장바구니 담기"}
              </button>
            </div>

            {/* 장바구니 바로가기 */}
            <Link
              href="/cart"
              className="mt-3 rounded-xl border bg-white px-5 py-4 text-center font-semibold hover:bg-gray-100"
            >
              장바구니 확인하기
            </Link>

            {message && (
              <p className="mt-5 rounded-xl bg-gray-100 p-4 text-center text-sm">
                {message}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}