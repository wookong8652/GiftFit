"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Order = {
  id: string;
  user_id: string | null;
  order_id: string | null;
  payment_key: string | null;
  amount: number | null;
  status: string | null;
  created_at: string;
};

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

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

    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, user_id, order_id, payment_key, amount, status, created_at"
      )
      .order("created_at", { ascending: false });

    console.log("주문 데이터:", data);
    console.log("주문 오류:", error);

    if (error) {
      setErrorMessage(error.message);
      console.error(error);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }

  async function changeStatus(id: string, status: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("상태 변경 실패: " + error.message);
      console.error(error);
      return;
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? { ...order, status }
          : order
      )
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              주문 관리
            </h1>

            <p className="mt-2 text-gray-500">
              전체 주문 내역을 확인하고 배송 상태를 관리합니다.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="rounded-xl border bg-white px-5 py-3 font-semibold"
          >
            관리자 홈
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-600">
            <p className="font-bold">
              주문 정보를 불러오지 못했습니다.
            </p>

            <p className="mt-2 text-sm">
              {errorMessage}
            </p>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl bg-white shadow">
          {loading ? (
            <div className="p-10 text-center">
              주문을 불러오는 중...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              주문 내역이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-5 py-4 text-left">
                      주문번호
                    </th>

                    <th className="px-5 py-4 text-left">
                      사용자 ID
                    </th>

                    <th className="px-5 py-4 text-left">
                      금액
                    </th>

                    <th className="px-5 py-4 text-left">
                      결제상태
                    </th>

                    <th className="px-5 py-4 text-left">
                      주문일
                    </th>

                    <th className="px-5 py-4 text-left">
                      배송관리
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t"
                    >
                      <td className="px-5 py-4 font-semibold">
                        {order.order_id || order.id}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        {order.user_id || "-"}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {Number(
                          order.amount || 0
                        ).toLocaleString()}
                        원
                      </td>

                      <td className="px-5 py-4">
                        {order.status || "결제완료"}
                      </td>

                      <td className="px-5 py-4">
                        {new Date(
                          order.created_at
                        ).toLocaleString("ko-KR")}
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={
                            order.status || "결제완료"
                          }
                          onChange={(e) =>
                            changeStatus(
                              order.id,
                              e.target.value
                            )
                          }
                          className="rounded-lg border px-3 py-2"
                        >
                          <option value="결제완료">
                            결제완료
                          </option>

                          <option value="상품준비중">
                            상품준비중
                          </option>

                          <option value="배송중">
                            배송중
                          </option>

                          <option value="배송완료">
                            배송완료
                          </option>

                          <option value="주문취소">
                            주문취소
                          </option>
                        </select>
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