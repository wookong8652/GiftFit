"use client";

import { useEffect, useState } from "react";
import { products as initialProducts } from "../../data/products";

type Product = {
  id: string | number;
  name: string;
  category?: string;
  price: number;
  image?: string;
  description?: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  // 상품 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("giftfit_products");

    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      setProducts(initialProducts as Product[]);
      localStorage.setItem(
        "giftfit_products",
        JSON.stringify(initialProducts)
      );
    }
  }, []);

  // 상품 저장
  function saveProducts(newProducts: Product[]) {
    setProducts(newProducts);
    localStorage.setItem(
      "giftfit_products",
      JSON.stringify(newProducts)
    );
  }

  // 상품 삭제
  function deleteProduct(id: string | number) {
    const target = products.find(
      (product) => product.id === id
    );

    if (!target) return;

    const confirmDelete = window.confirm(
      `"${target.name}" 상품을 삭제하시겠습니까?`
    );

    if (!confirmDelete) return;

    const newProducts = products.filter(
      (product) => product.id !== id
    );

    saveProducts(newProducts);
  }

  // 상품 추가
  function addProduct() {
    if (!name.trim()) {
      alert("상품명을 입력해주세요.");
      return;
    }

    if (!price || Number(price) <= 0) {
      alert("가격을 입력해주세요.");
      return;
    }

    if (!category.trim()) {
      alert("카테고리를 입력해주세요.");
      return;
    }

    const newProduct: Product = {
      id: `admin-${Date.now()}`,
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      image: image.trim(),
      description: description.trim(),
    };

    saveProducts([newProduct, ...products]);

    // 입력창 초기화
    setName("");
    setCategory("");
    setPrice("");
    setImage("");
    setDescription("");

    alert("상품이 추가되었습니다.");
  }

  const filteredProducts = products.filter((product) => {
    const keyword = search.toLowerCase();

    return (
      product.name?.toLowerCase().includes(keyword) ||
      product.category?.toLowerCase().includes(keyword) ||
      product.description?.toLowerCase().includes(keyword)
    );
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">

        {/* 상단 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              상품 관리
            </h1>

            <p className="mt-2 text-gray-500">
              상품을 추가하거나 삭제할 수 있습니다.
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href = "/admin";
            }}
            className="rounded-xl border bg-white px-5 py-3 font-semibold hover:bg-gray-100"
          >
            관리자 홈
          </button>
        </div>

        {/* 상품 추가 */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow">

          <h2 className="mb-5 text-xl font-bold">
            ➕ 상품 추가
          </h2>

          <div className="grid gap-4 md:grid-cols-2">

            <input
              type="text"
              placeholder="상품명"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border px-4 py-3"
            />

            <input
              type="text"
              placeholder="카테고리"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border px-4 py-3"
            />

            <input
              type="number"
              placeholder="가격"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="rounded-xl border px-4 py-3"
            />

            <input
              type="text"
              placeholder="이미지 주소 (선택)"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="rounded-xl border px-4 py-3"
            />

            <input
              type="text"
              placeholder="상품 설명"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="rounded-xl border px-4 py-3 md:col-span-2"
            />

          </div>

          <button
            onClick={addProduct}
            className="mt-5 rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
          >
            상품 추가
          </button>

        </div>

        {/* 검색 */}
        <div className="mb-5 rounded-2xl bg-white p-5 shadow">

          <input
            type="text"
            placeholder="상품명 또는 카테고리 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          />

        </div>

        {/* 상품 개수 */}
        <div className="mb-4">
          <span className="text-gray-600">
            전체 상품{" "}
            <strong className="text-black">
              {filteredProducts.length}개
            </strong>
          </span>
        </div>

        {/* 상품 목록 */}
        <div className="overflow-hidden rounded-2xl bg-white shadow">

          {filteredProducts.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              상품이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-5 py-4 text-left">
                      상품
                    </th>

                    <th className="px-5 py-4 text-left">
                      카테고리
                    </th>

                    <th className="px-5 py-4 text-left">
                      가격
                    </th>

                    <th className="px-5 py-4 text-left">
                      ID
                    </th>

                    <th className="px-5 py-4 text-center">
                      관리
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t hover:bg-gray-50"
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-4">

                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-16 w-16 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                              이미지 없음
                            </div>
                          )}

                          <div>
                            <p className="font-semibold">
                              {product.name}
                            </p>

                            {product.description && (
                              <p className="mt-1 max-w-md truncate text-gray-500">
                                {product.description}
                              </p>
                            )}
                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-gray-100 px-3 py-1">
                          {product.category || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {Number(product.price).toLocaleString()}원
                      </td>

                      <td className="px-5 py-4 text-gray-500">
                        {product.id}
                      </td>

                      <td className="px-5 py-4 text-center">

                        <button
                          onClick={() =>
                            deleteProduct(product.id)
                          }
                          className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
                        >
                          삭제
                        </button>

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