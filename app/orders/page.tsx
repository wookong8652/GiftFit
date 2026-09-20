"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Order = {
  id: number;
  order_id: string;
  payment_key: string | null;
  order_name: string;
  amount: number;
  status: string;
  created_at: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setOrders([]);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("주문내역 조회 오류:", error);
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("ko-KR");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h1 className="text-3xl font-bold">주문내역</h1>
          <p className="mt-6 text-gray-500">
            주문내역을 불러오는 중입니다...
          </p>
        </div>
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
            <Link href="/" className="hover:text-black">
              홈
            </Link>

            <Link href="/cart" className="hover:text-black">
              장바구니
            </Link>

            <Link href="/orders" className="font-semibold text-black">
              주문내역
            </Link>
          </nav>
        </div>
      </header>

      {/* 주문내역 */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">주문내역</h1>
          <p className="mt-2 text-gray-500">
            내가 결제한 상품을 확인할 수 있습니다.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center">
            <p className="text-lg font-semibold">
              주문내역이 없습니다.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              상품을 구매하면 주문내역이 여기에 표시됩니다.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-black px-6 py-3 text-sm font-medium text-white"
            >
              상품 보러가기
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs text-gray-400">
                      주문번호
                    </p>

                    <p className="mt-1 font-mono text-sm">
                      {order.order_id}
                    </p>
                  </div>

                  <div>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      {order.status === "DONE"
                        ? "결제완료"
                        : order.status}
                    </span>
                  </div>
                </div>

                <div className="my-5 border-t" />

                <div>
                  <p className="text-xs text-gray-400">
                    상품
                  </p>

                  <h2 className="mt-1 text-lg font-semibold">
                    {order.order_name}
                  </h2>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-gray-400">
                      결제금액
                    </p>

                    <p className="mt-1 font-bold">
                      {order.amount.toLocaleString()}원
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      결제일시
                    </p>

                    <p className="mt-1 text-sm">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      결제상태
                    </p>

                    <p className="mt-1 text-sm font-semibold text-green-600">
                      결제완료
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}