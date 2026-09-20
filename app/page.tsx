"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "./components/Header";
import { products } from "./data/products";

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("전체");
  const [sort, setSort] = useState("추천순");

  // 이미지가 없거나 깨졌을 때 사용할 기본 이미지
  const FALLBACK_IMAGE =
    "https://placehold.co/600x600/f3f4f6/6b7280?text=GiftFit";

  // 카테고리 목록
  const categories = [
    "전체",
    ...Array.from(
      new Set(products.map((product) => product.category))
    ),
  ];

  // 검색 + 카테고리 + 정렬
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const keyword = search.toLowerCase().trim();

      const matchesSearch =
        keyword === "" ||
        product.name.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword) ||
        product.tags?.some((tag: string) =>
          tag.toLowerCase().includes(keyword)
        );

      const matchesCategory =
        category === "전체" ||
        product.category === category;

      return matchesSearch && matchesCategory;
    });

    // 낮은 가격순
    if (sort === "낮은가격순") {
      result = [...result].sort(
        (a, b) => a.price - b.price
      );
    }

    // 높은 가격순
    if (sort === "높은가격순") {
      result = [...result].sort(
        (a, b) => b.price - a.price
      );
    }

    return result;
  }, [search, category, sort]);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50">

        {/* =========================
            메인 소개
        ========================== */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16 text-center">

            <p className="text-sm font-semibold text-gray-500">
              GiftFit
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              당신에게 딱 맞는 선물
            </h1>

            <p className="mt-4 text-gray-500">
              취향에 맞는 특별한 선물을 찾아보세요.
            </p>

            <Link
              href="/recommend"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-black px-7 py-3 font-medium text-white transition hover:bg-gray-800"
            >
              🎁 AI 선물 추천받기
            </Link>
          </div>
        </section>

        {/* =========================
            상품 영역
        ========================== */}
        <section className="mx-auto max-w-7xl px-6 py-12">

          {/* 검색 박스 */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <div className="relative">

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="상품명, 카테고리, 태그로 검색해보세요"
                className="w-full rounded-xl border border-gray-200 px-5 py-4 pr-12 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              />

              <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xl">
                🔍
              </span>
            </div>

            {/* =========================
                카테고리
            ========================== */}
            <div className="mt-5 flex flex-wrap gap-2">

              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    category === item
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {item}
                </button>
              ))}

            </div>
          </div>

          {/* =========================
              상품 헤더
          ========================== */}
          <div className="mb-6 mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-2xl font-bold">
                상품
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {filteredProducts.length}개의 상품이 있습니다.
              </p>
            </div>

            {/* 정렬 */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
            >
              <option value="추천순">추천순</option>
              <option value="낮은가격순">낮은 가격순</option>
              <option value="높은가격순">높은 가격순</option>
            </select>

          </div>

          {/* =========================
              검색 결과 없음
          ========================== */}
          {filteredProducts.length === 0 ? (

            <div className="rounded-3xl bg-white py-20 text-center">

              <p className="text-5xl">
                🔍
              </p>

              <h3 className="mt-5 text-xl font-bold">
                검색 결과가 없습니다.
              </h3>

              <p className="mt-2 text-gray-500">
                다른 상품명이나 태그로 검색해보세요.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setCategory("전체");
                }}
                className="mt-6 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                검색 초기화
              </button>

            </div>

          ) : (

            /* =========================
                상품 목록
            ========================== */
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">

              {filteredProducts.map((product) => (

                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* =========================
                      상품 이미지
                  ========================== */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">

                    <img
                      src={product.image || FALLBACK_IMAGE}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target =
                          e.currentTarget;

                        // 이미지가 이미 기본 이미지라면 무한 반복 방지
                        if (
                          target.src !== FALLBACK_IMAGE
                        ) {
                          target.src =
                            FALLBACK_IMAGE;
                        }
                      }}
                    />

                  </div>

                  {/* =========================
                      상품 정보
                  ========================== */}
                  <div className="p-4">

                    {/* 카테고리 */}
                    <p className="text-xs font-medium text-gray-500">
                      {product.category}
                    </p>

                    {/* 상품명 */}
                    <h3 className="mt-2 min-h-[48px] font-semibold leading-6 text-gray-900">
                      {product.name}
                    </h3>

                    {/* 가격 */}
                    <p className="mt-3 text-lg font-bold text-gray-900">
                      {product.price.toLocaleString()}원
                    </p>

                    {/* 태그 */}
                    {product.tags &&
                      product.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">

                          {product.tags
                            .slice(0, 3)
                            .map((tag: string) => (

                              <span
                                key={tag}
                                className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                              >
                                #{tag}
                              </span>

                            ))}

                        </div>
                      )}

                  </div>

                </Link>

              ))}

            </div>

          )}

        </section>

      </main>
    </>
  );
}