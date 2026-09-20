"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { products } from "../data/products";

type CartItem = {
  productId: string;
  quantity: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("giftfit-cart");

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        setCart([]);
      }
    }

    setLoaded(true);
  }, []);

  // 장바구니 저장
  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem("giftfit-cart", JSON.stringify(cart));
  }, [cart, loaded]);

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) =>
        prev.filter(
          (item) => String(item.productId) !== String(productId)
        )
      );
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        String(item.productId) === String(productId)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => String(item.productId) !== String(productId)
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("giftfit-cart");
  };

  const cartProducts = cart
    .map((item) => {
      const product = products.find(
        (p) => String(p.id) === String(item.productId)
      );

      return {
        ...item,
        product,
      };
    })
    .filter((item) => item.product);

  const totalPrice = cartProducts.reduce(
    (sum, item) =>
      sum + (item.product?.price || 0) * item.quantity,
    0
  );

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        장바구니를 불러오는 중...
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

          <nav className="flex gap-6 text-sm text-gray-600">
            <Link href="/">홈</Link>
            <Link href="/mypage">마이페이지</Link>
            <Link
              href="/cart"
              className="font-semibold text-black"
            >
              장바구니
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              장바구니
            </h1>

            <p className="mt-2 text-gray-500">
              담은 상품을 확인하세요.
            </p>
          </div>

          {cartProducts.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-gray-500 underline"
            >
              전체 삭제
            </button>
          )}
        </div>

        {cartProducts.length === 0 ? (
          <div className="rounded-3xl bg-white p-16 text-center shadow-sm">
            <div className="text-5xl">🛒</div>

            <h2 className="mt-5 text-xl font-bold">
              장바구니가 비어있습니다.
            </h2>

            <p className="mt-2 text-gray-500">
              마음에 드는 상품을 장바구니에 담아보세요.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white"
            >
              상품 보러가기
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* 상품 목록 */}
            <div className="space-y-4 lg:col-span-2">
              {cartProducts.map((item) => {
                const product = item.product!;

                return (
                  <div
                    key={product.id}
                    className="flex gap-5 rounded-2xl bg-white p-5 shadow-sm"
                  >
                    {/* 이미지 */}
                    <Link
                      href={`/products/${product.id}`}
                      className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>

                    {/* 정보 */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="text-xs text-gray-500">
                          {product.category}
                        </p>

                        <Link
                          href={`/products/${product.id}`}
                          className="mt-1 block font-semibold hover:underline"
                        >
                          {product.name}
                        </Link>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* 수량 */}
                        <div className="flex items-center overflow-hidden rounded-lg border">
                          <button
                            onClick={() =>
                              updateQuantity(
                                String(product.id),
                                item.quantity - 1
                              )
                            }
                            className="px-3 py-2 hover:bg-gray-100"
                          >
                            −
                          </button>

                          <span className="min-w-10 text-center">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(
                                String(product.id),
                                item.quantity + 1
                              )
                            }
                            className="px-3 py-2 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-bold">
                            {(
                              product.price * item.quantity
                            ).toLocaleString()}
                            원
                          </span>

                          <button
                            onClick={() =>
                              removeItem(String(product.id))
                            }
                            className="text-sm text-gray-400 hover:text-black"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 결제 정보 */}
            <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">
                주문 금액
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    상품 금액
                  </span>

                  <span>
                    {totalPrice.toLocaleString()}원
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    배송비
                  </span>

                  <span>무료</span>
                </div>

                <div className="h-px bg-gray-200" />

                <div className="flex justify-between">
                  <span className="font-bold">
                    총 결제금액
                  </span>

                  <span className="text-2xl font-bold">
                    {totalPrice.toLocaleString()}원
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-7 block rounded-xl bg-black px-5 py-4 text-center font-bold text-white hover:bg-gray-800"
              >
                주문하기
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}