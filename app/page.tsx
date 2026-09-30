"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "./components/Header";
import { products as initialProducts } from "./data/products";

type Product = {
  id: string | number;
  name: string;
  price: number;
  category?: string;
  image?: string;
  description?: string;
  tags?: string[];
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>(
    initialProducts as Product[]
  );

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sort, setSort] = useState("추천순");

  // 관리자 상품관리에서 변경한 상품 불러오기
  useEffect(() => {
    const savedProducts = localStorage.getItem("giftfit_products");

    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts);

        if (Array.isArray(parsedProducts)) {
          setProducts(parsedProducts);
        }
      } catch (error) {
        console.error(
          "상품 데이터를 불러오는 중 오류가 발생했습니다.",
          error
        );
      }
    }
  }, []);

  // 카테고리
  const categories = useMemo(() => {
    const categorySet = new Set<string>();

    products.forEach((product) => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });

    return ["전체", ...Array.from(categorySet)];
  }, [products]);

  // 상품 필터링 / 검색 / 정렬
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 검색
    if (search.trim()) {
      const keyword = search.toLowerCase();

      result = result.filter((product) => {
        return (
          product.name?.toLowerCase().includes(keyword) ||
          product.category?.toLowerCase().includes(keyword) ||
          product.description?.toLowerCase().includes(keyword) ||
          product.tags?.some((tag) =>
            tag.toLowerCase().includes(keyword)
          )
        );
      });
    }

    // 카테고리
    if (selectedCategory !== "전체") {
      result = result.filter(
        (product) => product.category === selectedCategory
      );
    }

    // 정렬
    if (sort === "낮은가격순") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sort === "높은가격순") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [products, search, selectedCategory, sort]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header />

      {/* 메인 배너 */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="mb-3 text-sm font-semibold text-gray-500">
            GiftFit
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            당신에게 딱 맞는 선물
          </h1>

          <p className="mt-5 text-gray-500">
            취향에 맞는 특별한 선물을 찾아보세요.
          </p>

          <Link
            href="/recommend"
            className="mt-8 inline-flex rounded-full bg-black px-7 py-4 font-semibold text-white transition hover:bg-gray-800"
          >
            🎁 AI 선물 추천받기
          </Link>
        </div>
      </section>

      {/* 상품 영역 */}
      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* 검색 / 카테고리 */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">

          {/* 검색창 */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="상품명, 카테고리, 태그로 검색해보세요"
              className="w-full rounded-xl border border-gray-200 px-5 py-4 pr-12 outline-none transition focus:border-black"
            />

            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xl">
              🔍
            </span>
          </div>

          {/* 카테고리 */}
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  selectedCategory === category
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 상품 제목 / 정렬 */}
        <div className="mt-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              상품
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredProducts.length}개의 상품이 있습니다.
            </p>
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="추천순">추천순</option>
            <option value="낮은가격순">낮은가격순</option>
            <option value="높은가격순">높은가격순</option>
          </select>
        </div>

        {/* 상품 목록 */}
        {filteredProducts.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-white p-16 text-center shadow-sm">
            <p className="text-lg font-semibold">
              상품이 없습니다.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              검색어나 카테고리를 다시 확인해주세요.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                {/* 상품 이미지 */}
                <div className="aspect-square overflow-hidden bg-gray-100">

                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      GiftFit
                    </div>
                  )}

                </div>

                {/* 상품 정보 */}
                <div className="p-5">

                  {product.category && (
                    <p className="mb-2 text-xs text-gray-400">
                      {product.category}
                    </p>
                  )}

                  <h3 className="line-clamp-2 min-h-[48px] font-semibold">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                      {product.description}
                    </p>
                  )}

                  <p className="mt-4 text-lg font-bold">
                    {Number(product.price).toLocaleString()}원
                  </p>

                </div>

              </Link>
            ))}

          </div>
        )}
      </section>
    </main>
  );
}