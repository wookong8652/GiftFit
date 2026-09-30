import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      paymentKey,
      orderId,
      amount,
      userId,
      shippingAddressId,
    } = body;

    if (!paymentKey || !orderId || !amount || !userId) {
      return NextResponse.json(
        {
          message: "결제 정보가 부족합니다.",
        },
        {
          status: 400,
        }
      );
    }

    const secretKey =
      process.env.TOSS_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        {
          message:
            "TOSS_SECRET_KEY가 설정되지 않았습니다.",
        },
        {
          status: 500,
        }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          message:
            "Supabase 서버 환경변수가 설정되지 않았습니다.",
        },
        {
          status: 500,
        }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    // 배송지 조회
    let shippingAddress: any = null;

    if (shippingAddressId) {
      const { data, error } =
        await supabaseAdmin
          .from("shipping_addresses")
          .select("*")
          .eq("id", shippingAddressId)
          .eq("user_id", userId)
          .maybeSingle();

      if (error) {
        console.error(
          "배송지 조회 실패:",
          error
        );
      }

      shippingAddress = data;
    }

    // 토스 결제 승인
    const encodedKey = Buffer.from(
      `${secretKey}:`
    ).toString("base64");

    const response = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",

        headers: {
          Authorization: `Basic ${encodedKey}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "토스 결제 승인 실패:",
        data
      );

      return NextResponse.json(
        {
          message:
            data.message ||
            "결제 승인에 실패했습니다.",
          code: data.code,
        },
        {
          status: response.status,
        }
      );
    }

    const orderName =
      data.orderName ||
      "GiftFit 상품";

    // 주문 저장
    const { data: savedOrder, error } =
      await supabaseAdmin
        .from("orders")
        .insert({
          user_id: userId,
          order_id: orderId,
          payment_key: paymentKey,
          order_name: orderName,
          amount: amount,
          status: "DONE",

          shipping_address_id:
            shippingAddress?.id ?? null,

          recipient_name:
            shippingAddress?.recipient_name ??
            null,

          recipient_phone:
            shippingAddress?.recipient_phone ??
            null,

          postcode:
            shippingAddress?.postcode ??
            null,

          shipping_address:
            shippingAddress?.address ??
            null,

          shipping_detail_address:
            shippingAddress?.detail_address ??
            null,
        })
        .select()
        .single();

    if (error) {
      console.error(
        "주문 저장 실패:",
        error
      );

      return NextResponse.json(
        {
          message:
            "결제는 승인되었지만 주문 저장에 실패했습니다.",
          detail: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "결제 및 주문 저장이 완료되었습니다.",
      payment: data,
      order: savedOrder,
    });
  } catch (error) {
    console.error(
      "결제 승인 API 오류:",
      error
    );

    return NextResponse.json(
      {
        message:
          "결제 승인 처리 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}