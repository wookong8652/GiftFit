"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "../components/Header";
import { products } from "../data/products";

export default function RecommendPage() {
  const [person, setPerson] = useState("");
  const [budget, setBudget] = useState("");
  const [taste, setTaste] = useState("");

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showResult, setShowResult] = useState(false);

  // 예산 범위 확인
  function checkBudget(price: number) {
    if (budget === "1만원 이하") {
      return price <= 10000;
    }

    if (budget === "1~3만원") {
      return price > 10000 && price <= 30000;
    }

    if (budget === "3~5만원") {
      return price > 30000 && price <= 50000;
    }

    if (budget === "5만원 이상") {
      return price > 50000;
    }

    return true;
  }

  // 추천 상품 계산
  function handleRecommend() {
    if (!person || !budget || !taste) {
      alert("선물 대상, 예산, 취향을 모두 선택해주세요.");
      return;
    }

    const scoredProducts = products.map((product) => {
      let score = 0;

      const tags = product.tags?.map((tag: string) =>
        tag.toLowerCase()
      ) || [];

      const category =
        product.category?.toLowerCase() || "";

      const productName =
        product.name?.toLowerCase() || "";

      // -----------------------------
      // 1. 예산 점수
      // -----------------------------
      if (checkBudget(product.price)) {
        score += 5;
      }

      // -----------------------------
      // 2. 취향 점수
      // -----------------------------
      if (
        taste === "실용적인" &&
        (tags.includes("실용적") ||
          tags.includes("실용") ||
          tags.includes("생활"))
      ) {
        score += 5;
      }

      if (
        taste === "감성적인" &&
        (tags.includes("감성") ||
          tags.includes("감성적") ||
          tags.includes("예쁜"))
      ) {
        score += 5;
      }

      if (
        taste === "귀여운" &&
        (tags.includes("귀여운") ||
          tags.includes("귀여움") ||
          tags.includes("캐릭터"))
      ) {
        score += 5;
      }

      if (
        taste === "고급스러운" &&
        (tags.includes("고급") ||
          tags.includes("프리미엄") ||
          tags.includes("럭셔리"))
      ) {
        score += 5;
      }

      if (
        taste === "트렌디한" &&
        (tags.includes("트렌디") ||
          tags.includes("인기") ||
          tags.includes("패션"))
      ) {
        score += 5;
      }

      // 상품 이름이나 카테고리에 취향 관련 단어가 있는 경우
      if (productName.includes(taste.replace("적인", ""))) {
        score += 2;
      }

      if (category.includes(taste.replace("적인", ""))) {
        score += 2;
      }

      // -----------------------------
      // 3. 선물 대상 점수
      // -----------------------------

      if (
        person === "연인" &&
        (tags.includes("커플") ||
          tags.includes("로맨틱") ||
          tags.includes("감성") ||
          tags.includes("선물"))
      ) {
        score += 4;
      }

      if (
        person === "친구" &&
        (tags.includes("친구") ||
          tags.includes("재미") ||
          tags.includes("귀여운") ||
          tags.includes("선물"))
      ) {
        score += 4;
      }

      if (
        person === "가족" &&
        (tags.includes("가족") ||
          tags.includes("실용적") ||
          tags.includes("건강") ||
          tags.includes("생활"))
      ) {
        score += 4;
      }

      if (
        person === "직장동료" &&
        (tags.includes("실용적") ||
          tags.includes("사무용품") ||
          tags.includes("커피") ||
          tags.includes("선물"))
      ) {
        score += 4;
      }

      return {
        ...product,
        score,
      };
    });

    // 점수가 높은 상품부터 정렬
    const sortedProducts = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    setRecommendations(sortedProducts);
    setShowResult(true);
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          {/* 제목 */}
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-500">
              GiftFit AI
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              나에게 딱 맞는 선물 찾기
            </h1>

            <p className="mt-4 text-gray-500">
              몇 가지 질문에 답하면 취향에 맞는 선물을
              추천해드릴게요.
            </p>
          </div>

          {/* 질문 영역 */}
          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm md:p-10">
            {/* 선물 대상 */}
            <div>
              <h2 className="text-lg font-bold">
                1. 누구에게 선물하나요?
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  "연인",
                  "친구",
                  "가족",
                  "직장동료",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setPerson(item)}
                    className={`rounded-xl border px-4 py-4 font-medium transition ${
                      person === item
                        ? "border-black bg-black text-white"
                        : "border-gray-200 hover:border-black"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* 예산 */}
            <div className="mt-10">
              <h2 className="text-lg font-bold">
                2. 예산은 어느 정도인가요?
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  "1만원 이하",
                  "1~3만원",
                  "3~5만원",
                  "5만원 이상",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setBudget(item)}
                    className={`rounded-xl border px-4 py-4 font-medium transition ${
                      budget === item
                        ? "border-black bg-black text-white"
                        : "border-gray-200 hover:border-black"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* 취향 */}
            <div className="mt-10">
              <h2 className="text-lg font-bold">
                3. 어떤 스타일을 좋아하나요?
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                {[
                  "실용적인",
                  "감성적인",
                  "귀여운",
                  "고급스러운",
                  "트렌디한",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setTaste(item)}
                    className={`rounded-xl border px-4 py-4 font-medium transition ${
                      taste === item
                        ? "border-black bg-black text-white"
                        : "border-gray-200 hover:border-black"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* 추천 버튼 */}
            <button
              onClick={handleRecommend}
              className="mt-10 w-full rounded-xl bg-black py-4 font-semibold text-white transition hover:bg-gray-800"
            >
              🎁 선물 추천받기
            </button>
          </div>

          {/* 추천 결과 */}
          {showResult && (
            <section className="mt-12">
              <div className="mb-6 text-center">
                <p className="text-sm font-semibold text-gray-500">
                  GiftFit Recommendation
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  당신에게 추천하는 선물
                </h2>

                <p className="mt-2 text-gray-500">
                  선택하신 조건을 바탕으로 추천했습니다.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {recommendations.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* 이미지 */}
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* 정보 */}
                    <div className="p-5">
                      <p className="text-xs text-gray-500">
                        {product.category}
                      </p>

                      <h3 className="mt-2 min-h-[48px] font-bold">
                        {product.name}
                      </h3>

                      <p className="mt-3 text-xl font-bold">
                        {product.price.toLocaleString()}원
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {product.tags
                          ?.slice(0, 3)
                          .map((tag: string) => (
                            <span
                              key={tag}
                              className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                            >
                              #{tag}
                            </span>
                          ))}
                      </div>

                      <div className="mt-5 rounded-xl bg-gray-100 py-3 text-center text-sm font-medium">
                        상품 상세보기 →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* 다시 추천 */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setShowResult(false);
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="rounded-xl border bg-white px-6 py-3 text-sm font-medium hover:bg-gray-50"
                >
                  다시 추천받기
                </button>
              </div>
            </section>
          )}

          {/* 홈으로 */}
          <div className="mt-10 text-center">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-black"
            >
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}