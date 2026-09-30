"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 로그인 안 했으면 로그인 페이지
    if (!user) {
      router.replace("/login");
      return;
    }

    // 관리자 이메일 확인
    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("id, email")
      .eq("email", user.email)
      .maybeSingle();

    if (error || !admin) {
      alert("관리자 권한이 없습니다.");
      router.replace("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>관리자 권한을 확인하고 있습니다...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">

        <h1 className="mb-2 text-3xl font-bold">
          GiftFit 관리자 페이지
        </h1>

        <p className="mb-8 text-gray-500">
          관리자 전용 페이지입니다.
        </p>

        <div className="grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold">
              📦 주문 관리
            </h2>

            <p className="mt-2 text-gray-500">
              전체 주문 내역을 확인합니다.
            </p>

            <button
              onClick={() => router.push("/admin/orders")}
              className="mt-5 rounded-lg bg-black px-4 py-2 text-white"
            >
              주문 관리
            </button>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold">
              🛍️ 상품 관리
            </h2>

            <p className="mt-2 text-gray-500">
              상품을 관리합니다.
            </p>

            <button
              onClick={() => router.push("/admin/products")}
              className="mt-5 rounded-lg bg-black px-4 py-2 text-white"
            >
              상품 관리
            </button>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold">
              👥 회원 관리
            </h2>

            <p className="mt-2 text-gray-500">
              회원 정보를 확인합니다.
            </p>

            <button
              onClick={() => router.push("/admin/users")}
              className="mt-5 rounded-lg bg-black px-4 py-2 text-white"
            >
              회원 관리
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}