"use client";

import { useEffect, useRef, useState } from "react";
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

type TossWidgets = any;

declare global {
  interface Window {
    daum?: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [amount, setAmount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [widgets, setWidgets] = useState<TossWidgets>(null);

  const [errorMessage, setErrorMessage] = useState("");

  // 배송정보
  const [recipient, setRecipient] = useState("");
  const [phone, setPhone] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  const initializedRef = useRef(false);

  /*
   * ----------------------------------------
   * 1. 장바구니 / 로그인 확인
   * ----------------------------------------
   */
  useEffect(() => {
    loadCheckout();
  }, []);

  async function loadCheckout() {
    try {
      setLoading(true);
      setErrorMessage("");

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

      if (!parsedCart.length) {
        alert("장바구니가 비어있습니다.");
        router.push("/cart");
        return;
      }

      setCart(parsedCart);

      // 총 금액 계산
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

      // 여기서는 결제 SDK를 아직 실행하지 않는다.
      // 먼저 화면(DOM)이 렌더링되어야 한다.
      setLoading(false);
    } catch (error) {
      console.error("주문 정보 불러오기 오류:", error);

      setErrorMessage(
        "주문 정보를 불러오는 중 오류가 발생했습니다."
      );

      setLoading(false);
    }
  }

  /*
   * ----------------------------------------
   * 2. 화면에 #payment-method가 만들어진 후
   *    토스 결제 UI 초기화
   * ----------------------------------------
   */
  useEffect(() => {
    if (loading) {
      return;
    }

    if (amount <= 0) {
      return;
    }

    if (initializedRef.current) {
      return;
    }

    initializeToss();
  }, [loading, amount]);

  async function initializeToss() {
    if (initializedRef.current) {
      return;
    }

    try {
      initializedRef.current = true;

      setPaymentLoading(true);
      setErrorMessage("");

      // 혹시 DOM 렌더링이 완전히 끝나지 않은 경우를 대비
      await new Promise((resolve) => {
        requestAnimationFrame(() => resolve(null));
      });

      const paymentElement =
        document.querySelector("#payment-method");

      const agreementElement =
        document.querySelector("#agreement");

      if (!paymentElement || !agreementElement) {
        throw new Error(
          "결제 영역을 찾을 수 없습니다."
        );
      }

      // 토스 SDK 불러오기
      const { loadTossPayments } = await import(
        "@tosspayments/tosspayments-sdk"
      );

      const clientKey =
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

      if (!clientKey) {
        throw new Error(
          "NEXT_PUBLIC_TOSS_CLIENT_KEY가 설정되지 않았습니다."
        );
      }

      const tossPayments =
        await loadTossPayments(clientKey);

      // 현재 로그인 사용자
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "로그인 정보를 확인할 수 없습니다."
        );
      }

      // 고객 키
      const customerKey = user.id;

      const paymentWidgets =
        tossPayments.widgets({
          customerKey,
        });

      // 금액 설정
      await paymentWidgets.setAmount({
        currency: "KRW",
        value: amount,
      });

      /*
       * 결제수단 렌더링
       */
      await paymentWidgets.renderPaymentMethods({
        selector: "#payment-method",
        variantKey: "DEFAULT",
      });

      /*
       * 약관 렌더링
       */
      await paymentWidgets.renderAgreement({
        selector: "#agreement",
        variantKey: "AGREEMENT",
      });

      setWidgets(paymentWidgets);
    } catch (error) {
      console.error(
        "토스 결제 초기화 오류:",
        error
      );

      initializedRef.current = false;

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "결제 준비 중 오류가 발생했습니다."
      );
    } finally {
      setPaymentLoading(false);
    }
  }

  /*
   * ----------------------------------------
   * 3. 다음 주소 검색
   * ----------------------------------------
   */
  function searchAddress() {
    if (!window.daum) {
      alert(
        "주소 검색 서비스를 불러오는 중입니다.\n잠시 후 다시 시도해주세요."
      );
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data: any) {
        let selectedAddress = "";

        if (data.userSelectedType === "R") {
          selectedAddress = data.roadAddress;
        } else {
          selectedAddress = data.jibunAddress;
        }

        setZipcode(data.zonecode);
        setAddress(selectedAddress);

        // 상세주소에 자동 포커스
        setTimeout(() => {
          const element =
            document.getElementById(
              "detail-address"
            ) as HTMLInputElement | null;

          element?.focus();
        }, 100);
      },
    }).open();
  }

  /*
   * ----------------------------------------
   * 4. 결제하기
   * ----------------------------------------
   */
  async function handlePayment() {
    if (!widgets) {
      alert("결제 준비가 완료되지 않았습니다.");
      return;
    }

    if (paymentLoading) {
      alert("결제수단을 준비하고 있습니다.");
      return;
    }

    if (amount <= 0) {
      alert("결제 금액이 올바르지 않습니다.");
      return;
    }

    // 배송정보 확인
    if (!recipient.trim()) {
      alert("받는 분 이름을 입력해주세요.");
      return;
    }

    if (!phone.trim()) {
      alert("휴대폰 번호를 입력해주세요.");
      return;
    }

    if (!zipcode || !address) {
      alert("주소를 검색해주세요.");
      return;
    }

    if (!detailAddress.trim()) {
      alert("상세주소를 입력해주세요.");
      return;
    }

    try {
      setPaymentLoading(true);

      /*
       * 주문번호
       */
      const orderId =
        `GIFT-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}`;

      /*
       * 첫 번째 상품
       */
      const firstProduct = cart[0];

      const product = products.find(
        (p: Product) =>
          String(p.id) ===
          String(firstProduct.productId)
      );

      /*
       * 주문 이름
       */
      const orderName =
        cart.length > 1
          ? `${product?.name ?? "상품"} 외 ${
              cart.length - 1
            }건`
          : product?.name ?? "GiftFit 상품";

      /*
       * 배송정보 저장
       *
       * 현재는 결제 요청에 함께 저장해둔다.
       * 필요하면 나중에 orders 테이블에
       * recipient / phone / address 컬럼을 추가해서
       * 서버에 저장할 수 있다.
       */
      localStorage.setItem(
        `giftfit-delivery-${orderId}`,
        JSON.stringify({
          recipient,
          phone,
          zipcode,
          address,
          detailAddress,
        })
      );

      /*
       * 토스 결제 요청
       */
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

      alert(
        error instanceof Error
          ? error.message
          : "결제 요청 중 오류가 발생했습니다."
      );

      setPaymentLoading(false);
    }
  }

  /*
   * ----------------------------------------
   * 로딩
   * ----------------------------------------
   */
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl">🎁</div>

          <p className="mt-4 text-lg font-bold">
            주문 정보를 준비하고 있습니다.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            잠시만 기다려주세요.
          </p>
        </div>
      </main>
    );
  }

  /*
   * ----------------------------------------
   * 화면
   * ----------------------------------------
   */
  return (
    <>
      {/* 다음 주소 검색 스크립트 */}
      <script
        src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        async
      />

      <main className="min-h-screen bg-gray-50 py-10">
        <div className="mx-auto max-w-4xl px-6">

          {/* 제목 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              주문 / 결제
            </h1>

            <p className="mt-2 text-gray-500">
              배송정보를 입력하고 결제해주세요.
            </p>
          </div>

          {/* 오류 메시지 */}
          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="font-bold text-red-600">
                결제 준비 중 오류가 발생했습니다.
              </p>

              <p className="mt-2 text-sm text-red-500">
                {errorMessage}
              </p>

              <button
                onClick={() => {
                  initializedRef.current = false;
                  initializeToss();
                }}
                className="mt-4 rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* -------------------------------- */}
          {/* 주문 상품 */}
          {/* -------------------------------- */}
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
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-20 w-20 rounded-xl object-cover"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {product.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {product.price.toLocaleString()}
                        원 × {item.quantity}개
                      </p>
                    </div>

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

          {/* -------------------------------- */}
          {/* 배송 정보 */}
          {/* -------------------------------- */}
          <section className="mb-6 rounded-2xl border bg-white p-6">
            <h2 className="mb-6 text-xl font-bold">
              배송 정보
            </h2>

            {/* 받는 분 */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold">
                받는 분
              </label>

              <input
                type="text"
                value={recipient}
                onChange={(e) =>
                  setRecipient(e.target.value)
                }
                placeholder="받는 분 이름"
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
              />
            </div>

            {/* 휴대폰 */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold">
                휴대폰 번호
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="010-1234-5678"
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
              />
            </div>

            {/* 우편번호 */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold">
                우편번호
              </label>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={zipcode}
                  readOnly
                  placeholder="우편번호"
                  className="flex-1 rounded-xl border bg-gray-50 px-4 py-3 outline-none"
                />

                <button
                  type="button"
                  onClick={searchAddress}
                  className="rounded-xl bg-black px-5 py-3 font-bold text-white hover:bg-gray-800"
                >
                  주소 검색
                </button>
              </div>
            </div>

            {/* 주소 */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold">
                주소
              </label>

              <input
                type="text"
                value={address}
                readOnly
                placeholder="주소 검색 버튼을 눌러주세요."
                className="w-full rounded-xl border bg-gray-50 px-4 py-3 outline-none"
              />
            </div>

            {/* 상세주소 */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                상세주소
              </label>

              <input
                id="detail-address"
                type="text"
                value={detailAddress}
                onChange={(e) =>
                  setDetailAddress(e.target.value)
                }
                placeholder="상세주소를 입력해주세요."
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
              />
            </div>
          </section>

          {/* -------------------------------- */}
          {/* 결제 금액 */}
          {/* -------------------------------- */}
          <section className="mb-6 rounded-2xl border bg-white p-6">
            <h2 className="mb-5 text-xl font-bold">
              결제 금액
            </h2>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">
                상품 금액
              </span>

              <span>
                {amount.toLocaleString()}원
              </span>
            </div>

            <div className="my-5 border-t" />

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">
                최종 결제 금액
              </span>

              <span className="text-2xl font-bold">
                {amount.toLocaleString()}원
              </span>
            </div>
          </section>

          {/* -------------------------------- */}
          {/* 결제수단 */}
          {/* -------------------------------- */}
          <section className="mb-6 rounded-2xl border bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">
              결제수단
            </h2>

            {/* 중요: 이 영역이 DOM에 먼저 존재해야 함 */}
            <div
              id="payment-method"
              className="min-h-[100px]"
            />

            {paymentLoading && !widgets && (
              <div className="py-8 text-center text-sm text-gray-500">
                결제수단을 불러오는 중입니다...
              </div>
            )}
          </section>

          {/* -------------------------------- */}
          {/* 약관 */}
          {/* -------------------------------- */}
          <section className="mb-6 rounded-2xl border bg-white p-6">
            <div id="agreement" />
          </section>

          {/* -------------------------------- */}
          {/* 결제 버튼 */}
          {/* -------------------------------- */}
          <button
            onClick={handlePayment}
            disabled={
              !widgets ||
              paymentLoading ||
              amount <= 0
            }
            className="w-full rounded-2xl bg-black py-4 text-lg font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {paymentLoading
              ? "결제 준비 중..."
              : `${amount.toLocaleString()}원 결제하기`}
          </button>

          {/* 장바구니 */}
          <button
            onClick={() =>
              router.push("/cart")
            }
            className="mt-3 w-full rounded-2xl border bg-white py-4 font-medium hover:bg-gray-50"
          >
            장바구니로 돌아가기
          </button>
        </div>
      </main>
    </>
  );
}