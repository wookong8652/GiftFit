"use client";

import Link from "next/link";

export default function PaymentFailPage() {
  const params = new URLSearchParams(
    typeof window !== "undefined"
      ? window.location.search
      : ""
  );

  const code = params.get("code");
  const message = params.get("message");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mb-5 text-5xl">❌</div>

        <h1 className="text-2xl font-bold">
          결제 실패
        </h1>

        <p className="mt-3 text-gray-600">
          {message || "결제 과정에서 문제가 발생했습니다."}
        </p>

        {code && (
          <p className="mt-2 text-sm text-gray-400">
            오류 코드: {code}
          </p>
        )}

        <Link
          href="/checkout"
          className="mt-8 block rounded-xl bg-black py-3 font-semibold text-white hover:bg-gray-800"
        >
          다시 결제하기
        </Link>

        <Link
          href="/"
          className="mt-3 block py-3 text-sm text-gray-500"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}