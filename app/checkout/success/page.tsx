"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function PaymentSuccessPage() {
  const [message, setMessage] = useState(
    "결제를 확인하고 있습니다..."
  );

  const [loading, setLoading] = useState(true);

  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) {
      return;
    }

    calledRef.current = true;

    async function confirmPayment() {
      try {
        // =========================
        // URL 결제 정보
        // =========================

        const params = new URLSearchParams(
          window.location.search
        );

        const paymentKey =
          params.get("paymentKey");

        const orderId =
          params.get("orderId");

        const amount =
          params.get("amount");

        // =========================
        // 로그인 사용자 확인
        // =========================

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error(
            "로그인 정보를 확인할 수 없습니다."
          );
        }

        // =========================
        // 결제 정보 확인
        // =========================

        if (
          !paymentKey ||
          !orderId ||
          !amount
        ) {
          throw new Error(
            "결제 정보가 없습니다."
          );
        }

        // =========================
        // 서버에 결제 승인 요청
        // =========================

        const response = await fetch(
          "/api/toss/confirm",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              paymentKey,
              orderId,
              amount: Number(amount),

              // 로그인 사용자 ID
              userId: user.id,
            }),
          }
        );

        const data =
          await response.json();

        // =========================
        // 승인 실패
        // =========================

        if (!response.ok) {
          throw new Error(
            data.message ||
              "결제 승인에 실패했습니다."
          );
        }

        // =========================
        // 성공
        // =========================

        console.log(
          "결제 승인 성공:",
          data
        );

        console.log(
          "주문 저장 완료:",
          data.order
        );

        setMessage(
          "결제가 정상적으로 완료되었습니다!"
        );

        setLoading(false);
      } catch (error) {
        console.error(
          "결제 승인 오류:",
          error
        );

        setMessage(
          error instanceof Error
            ? error.message
            : "결제 승인에 실패했습니다."
        );

        setLoading(false);
      }
    }

    confirmPayment();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

          {loading ? (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <span className="text-2xl">
                  ⏳
                </span>
              </div>

              <h1 className="text-2xl font-bold">
                결제 확인 중
              </h1>

              <p className="mt-3 text-gray-500">
                잠시만 기다려주세요.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <span className="text-3xl">
                  ✓
                </span>
              </div>

              <h1 className="text-2xl font-bold">
                {message}
              </h1>

              <p className="mt-3 text-gray-500">
                GiftFit을 이용해주셔서 감사합니다.
              </p>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => {
                    window.location.href =
                      "/orders";
                  }}
                  className="flex-1 rounded-xl border border-gray-200 py-4 font-bold hover:bg-gray-50"
                >
                  주문내역
                </button>

                <button
                  onClick={() => {
                    window.location.href =
                      "/";
                  }}
                  className="flex-1 rounded-xl bg-black py-4 font-bold text-white hover:bg-gray-800"
                >
                  홈으로
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}