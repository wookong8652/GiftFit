"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Address = {
  id: number;
  user_id: string;
  recipient_name: string;
  recipient_phone: string;
  postcode: string;
  address: string;
  detail_address: string | null;
  is_default: boolean;
};

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [postcode, setPostcode] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("로그인이 필요합니다.");
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("shipping_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        alert("배송지를 불러오지 못했습니다.");
        return;
      }

      setAddresses(data || []);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setRecipientName("");
    setRecipientPhone("");
    setPostcode("");
    setAddress("");
    setDetailAddress("");
    setIsDefault(false);
  }

  function editAddress(item: Address) {
    setEditingId(item.id);
    setRecipientName(item.recipient_name);
    setRecipientPhone(item.recipient_phone);
    setPostcode(item.postcode);
    setAddress(item.address);
    setDetailAddress(item.detail_address || "");
    setIsDefault(item.is_default);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveAddress() {
    if (
      !recipientName ||
      !recipientPhone ||
      !postcode ||
      !address
    ) {
      alert("필수 배송지 정보를 입력해주세요.");
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("로그인이 필요합니다.");
        return;
      }

      // 기본 배송지로 설정하는 경우
      if (isDefault) {
        await supabase
          .from("shipping_addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      if (editingId) {
        const { error } = await supabase
          .from("shipping_addresses")
          .update({
            recipient_name: recipientName,
            recipient_phone: recipientPhone,
            postcode,
            address,
            detail_address: detailAddress,
            is_default: isDefault,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }
      } else {
        const { data: existing } = await supabase
          .from("shipping_addresses")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        const shouldDefault =
          isDefault || !existing || existing.length === 0;

        const { error } = await supabase
          .from("shipping_addresses")
          .insert({
            user_id: user.id,
            recipient_name: recipientName,
            recipient_phone: recipientPhone,
            postcode,
            address,
            detail_address: detailAddress,
            is_default: shouldDefault,
          });

        if (error) {
          throw error;
        }
      }

      alert(
        editingId
          ? "배송지가 수정되었습니다."
          : "배송지가 추가되었습니다."
      );

      resetForm();
      await loadAddresses();
    } catch (error) {
      console.error(error);
      alert("배송지 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAddress(id: number) {
    if (!confirm("이 배송지를 삭제하시겠습니까?")) {
      return;
    }

    const { error } = await supabase
      .from("shipping_addresses")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("배송지 삭제에 실패했습니다.");
      return;
    }

    await loadAddresses();
  }

  async function makeDefault(id: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    await supabase
      .from("shipping_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);

    const { error } = await supabase
      .from("shipping_addresses")
      .update({ is_default: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      alert("기본 배송지 변경에 실패했습니다.");
      return;
    }

    await loadAddresses();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-10">
        <div className="mx-auto max-w-4xl">
          배송지를 불러오는 중입니다...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-4xl px-6">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            배송지 관리
          </h1>

          <p className="mt-2 text-gray-500">
            주문에 사용할 배송지를 관리할 수 있습니다.
          </p>
        </div>

        {/* 배송지 입력 */}
        <section className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold">
            {editingId
              ? "배송지 수정"
              : "새 배송지 추가"}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">

            <input
              value={recipientName}
              onChange={(e) =>
                setRecipientName(e.target.value)
              }
              placeholder="받는 분"
              className="rounded-xl border px-4 py-3"
            />

            <input
              value={recipientPhone}
              onChange={(e) =>
                setRecipientPhone(e.target.value)
              }
              placeholder="연락처"
              className="rounded-xl border px-4 py-3"
            />

            <input
              value={postcode}
              onChange={(e) =>
                setPostcode(e.target.value)
              }
              placeholder="우편번호"
              className="rounded-xl border px-4 py-3"
            />

            <input
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
              placeholder="주소"
              className="rounded-xl border px-4 py-3"
            />

            <input
              value={detailAddress}
              onChange={(e) =>
                setDetailAddress(e.target.value)
              }
              placeholder="상세주소"
              className="rounded-xl border px-4 py-3 md:col-span-2"
            />
          </div>

          <label className="mt-5 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) =>
                setIsDefault(e.target.checked)
              }
            />

            기본 배송지로 설정
          </label>

          <div className="mt-6 flex gap-3">
            <button
              onClick={saveAddress}
              disabled={saving}
              className="rounded-xl bg-black px-6 py-3 font-semibold text-white disabled:bg-gray-300"
            >
              {saving
                ? "저장 중..."
                : editingId
                ? "배송지 수정"
                : "배송지 추가"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="rounded-xl border px-6 py-3 font-semibold"
              >
                취소
              </button>
            )}
          </div>
        </section>

        {/* 배송지 목록 */}
        <section>
          <h2 className="mb-4 text-xl font-bold">
            저장된 배송지
          </h2>

          {addresses.length === 0 ? (
            <div className="rounded-2xl border bg-white p-10 text-center text-gray-500">
              등록된 배송지가 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">
                          {item.recipient_name}
                        </h3>

                        {item.is_default && (
                          <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                            기본 배송지
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-gray-600">
                        {item.recipient_phone}
                      </p>

                      <p className="mt-2">
                        [{item.postcode}] {item.address}
                      </p>

                      {item.detail_address && (
                        <p className="text-gray-600">
                          {item.detail_address}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      {!item.is_default && (
                        <button
                          onClick={() =>
                            makeDefault(item.id)
                          }
                          className="rounded-lg border px-3 py-2 text-sm"
                        >
                          기본 설정
                        </button>
                      )}

                      <button
                        onClick={() =>
                          editAddress(item)
                        }
                        className="rounded-lg border px-3 py-2 text-sm"
                      >
                        수정
                      </button>

                      <button
                        onClick={() =>
                          deleteAddress(item.id)
                        }
                        className="rounded-lg border px-3 py-2 text-sm text-red-600"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}