"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type User = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
};

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    // 관리자 확인
    const { data: admin } = await supabase
      .from("admin_users")
      .select("email")
      .eq("email", user.email)
      .maybeSingle();

    if (!admin) {
      alert("관리자 권한이 없습니다.");
      router.replace("/");
      return;
    }

    try {
      const response = await fetch("/api/admin/users");

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "회원 정보를 불러오지 못했습니다."
        );
      }

      setUsers(result.users || []);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "회원 정보를 불러오지 못했습니다."
      );
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              회원 관리
            </h1>

            <p className="mt-2 text-gray-500">
              GiftFit에 가입한 전체 회원을 확인합니다.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="rounded-xl border bg-white px-5 py-3 font-semibold"
          >
            관리자 홈
          </button>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow">
          <p className="text-gray-500">
            전체 회원
          </p>

          <p className="mt-1 text-4xl font-bold">
            {users.length}명
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-600">
            <p className="font-bold">
              회원 정보를 불러오지 못했습니다.
            </p>

            <p className="mt-2 text-sm">
              {errorMessage}
            </p>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl bg-white shadow">
          {loading ? (
            <div className="p-10 text-center">
              회원 정보를 불러오는 중...
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              가입한 회원이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      번호
                    </th>

                    <th className="px-6 py-4 text-left">
                      이메일
                    </th>

                    <th className="px-6 py-4 text-left">
                      가입일
                    </th>

                    <th className="px-6 py-4 text-left">
                      최근 로그인
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user.id}
                      className="border-t"
                    >
                      <td className="px-6 py-4">
                        {index + 1}
                      </td>

                      <td className="px-6 py-4 font-semibold">
                        {user.email || "-"}
                      </td>

                      <td className="px-6 py-4">
                        {user.created_at
                          ? new Date(
                              user.created_at
                            ).toLocaleString("ko-KR")
                          : "-"}
                      </td>

                      <td className="px-6 py-4">
                        {user.last_sign_in_at
                          ? new Date(
                              user.last_sign_in_at
                            ).toLocaleString("ko-KR")
                          : "로그인 기록 없음"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}