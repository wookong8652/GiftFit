"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { products } from "../data/products";

type CartItem = {
  productId: string | number;
  quantity: number;
};

type Product = {
  id: string | number;
  name: string;
  price: number;
  image: string;
};

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState<any>(null);

  useEffect(() => {
    loadCheckout();
  }, []);

  async function loadCheckout() {
    try {
      // 로그인 확인
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      // 장바구니 가져오기
      const savedCart = localStorage.getItem("giftfit-cart");

      if (!savedCart) {
        alert("장바구니가 비어있습니다.");
        router.push("/cart");
        return;
      }

      const parsedCart: CartItem[] = JSON.parse(savedCart);

      if (parsedCart.length === 0) {
        alert("장바구니가 비어있습니다.");
        router.push("/cart");
        return;
      }

      setCart(parsedCart);

      // 상품 가격 × 수량 계산
      const totalAmount = parsedCart.reduce(
        (total, item) => {
          const product = products.find(
            (p: Product) =>
              String(p.id) === String(item.productId)
          );

          if (!product) {
            return total;
          }

          return total + product.price * item.quantity;
        },
        0
      );

      if (totalAmount <= 0) {
        alert("결제할 상품이 없습니다.");
        router.push("/cart");
        return;
      }

      setAmount(totalAmount);

      // 토스 SDK
      const { loadTossPayments } = await import(
        "@tosspayments/tosspayments-sdk"
      );

      const clientKey =
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

      if (!clientKey) {
        console.error(
          "NEXT_PUBLIC_TOSS_CLIENT_KEY가 없습니다."
        );
        return;
      }

      const tossPayments =
        await loadTossPayments(clientKey);

      // 로그인한 사용자 UID 사용
      const customerKey = user.id;

      const paymentWidgets =
        tossPayments.widgets({
          customerKey,
        });

      // 실제 상품 가격으로 결제 금액 설정
      await paymentWidgets.setAmount({
        currency: "KRW",
        value: totalAmount,
      });

      // 결제수단 UI
      await paymentWidgets.renderPaymentMethods({
        selector: "#payment-method",
        variantKey: "DEFAULT",
      });

      // 약관 UI
      await paymentWidgets.renderAgreement({
        selector: "#agreement",
        variantKey: "AGREEMENT",
      });

      setWidgets(paymentWidgets);
    } catch (error) {
      // 팝업은 띄우지 않고 콘솔에만 오류 표시
      console.error(
        "결제 페이지 초기화 오류:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment() {
    if (!widgets) {
      alert("결제 준비가 완료되지 않았습니다.");
      return;
    }

    if (amount <= 0) {
      alert("결제 금액이 올바르지 않습니다.");
      return;
    }

    try {
      // 주문번호 생성
      const orderId =
        `GIFT-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}`;

      // 첫 번째 상품
      const firstProduct = cart[0];

      const product = products.find(
        (p: Product) =>
          String(p.id) ===
          String(firstProduct.productId)
      );

      // 주문 이름
      const orderName =
        cart.length > 1
          ? `${product?.name ?? "상품"} 외 ${
              cart.length - 1
            }건`
          : product?.name ?? "GiftFit 상품";

      // 토스 결제 요청
      await widgets.requestPayment({
        orderId,
        orderName,

        successUrl:
          `${window.location.origin}/checkout/success`,

        failUrl:
          `${window.location.origin}/checkout/fail`,
      });
    } catch (error) {
      console.error(
        "결제 요청 오류:",
        error
      );
    }
  }

  // 로딩 화면
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-medium">
            결제 페이지를 준비하고 있습니다.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            잠시만 기다려주세요.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-4xl px-6">

        {/* 제목 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            주문 / 결제
          </h1>

          <p className="mt-2 text-gray-500">
            선택하신 상품을 확인하고 결제해주세요.
          </p>
        </div>

        {/* 주문 상품 */}
        <section className="mb-6 rounded-2xl border bg-white p-6">
          <h2 className="mb-5 text-xl font-bold">
            주문 상품
          </h2>

          <div className="space-y-4">
            {cart.map((item) => {
              const product = products.find(
                (p: Product) =>
                  String(p.id) ===
                  String(item.productId)
              );

              if (!product) {
                return null;
              }

              return (
                <div
                  key={String(item.productId)}
                  className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                >
                  {/* 상품 이미지 */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-20 w-20 rounded-xl object-cover"
                  />

                  {/* 상품 정보 */}
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {product.price.toLocaleString()}
                      원 × {item.quantity}개
                    </p>
                  </div>

                  {/* 상품별 금액 */}
                  <p className="font-bold">
                    {(
                      product.price *
                      item.quantity
                    ).toLocaleString()}
                    원
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 최종 결제 금액 */}
        <section className="mb-6 rounded-2xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">
              최종 결제 금액
            </span>

            <span className="text-2xl font-bold">
              {amount.toLocaleString()}원
            </span>
          </div>
        </section>

        {/* 결제수단 */}
        <section className="mb-6 rounded-2xl border bg-white p-6">
          <h2 className="mb-4 text-xl font-bold">
            결제수단
          </h2>

          <div id="payment-method" />
        </section>

        {/* 약관 */}
        <section className="mb-6 rounded-2xl border bg-white p-6">
          <div id="agreement" />
        </section>

        {/* 결제 버튼 */}
        <button
          onClick={handlePayment}
          disabled={!widgets || amount <= 0}
          className="w-full rounded-2xl bg-black py-4 text-lg font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {amount.toLocaleString()}원 결제하기
        </button>

        {/* 장바구니로 돌아가기 */}
        <button
          onClick={() => router.push("/cart")}
          className="mt-3 w-full rounded-2xl border bg-white py-4 font-medium hover:bg-gray-50"
        >
          장바구니로 돌아가기
        </button>

      </div>
    </main>
  );
}