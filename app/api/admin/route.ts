import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function createAdminClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(url, key);
}

async function checkAdmin(request: Request) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token =
    authorization.replace("Bearer ", "");

  const publicClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const {
    data: { user },
    error,
  } = await publicClient.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  const adminEmail =
    process.env.ADMIN_EMAIL;

  if (
    !adminEmail ||
    user.email?.toLowerCase() !==
      adminEmail.toLowerCase()
  ) {
    return null;
  }

  return user;
}

export async function GET(request: Request) {
  try {
    const adminUser =
      await checkAdmin(request);

    if (!adminUser) {
      return NextResponse.json(
        {
          message:
            "관리자 권한이 없습니다.",
        },
        {
          status: 403,
        }
      );
    }

    const supabaseAdmin =
      createAdminClient();

    const [
      ordersResult,
      usersResult,
      addressesResult,
    ] = await Promise.all([
      supabaseAdmin
        .from("orders")
        .select("*")
        .order("created_at", {
          ascending: false,
        }),

      supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      }),

      supabaseAdmin
        .from("shipping_addresses")
        .select("*")
        .order("created_at", {
          ascending: false,
        }),
    ]);

    if (ordersResult.error) {
      throw ordersResult.error;
    }

    if (addressesResult.error) {
      throw addressesResult.error;
    }

    const orders =
      ordersResult.data || [];

    const users =
      usersResult.data?.users || [];

    const addresses =
      addressesResult.data || [];

    const totalSales =
      orders
        .filter(
          (order) =>
            order.status === "DONE"
        )
        .reduce(
          (sum, order) =>
            sum + Number(order.amount || 0),
          0
        );

    return NextResponse.json({
      success: true,

      stats: {
        totalOrders: orders.length,
        totalUsers: users.length,
        totalSales,
        totalAddresses:
          addresses.length,
      },

      orders,
      users,
      addresses,
    });
  } catch (error) {
    console.error(
      "관리자 데이터 조회 오류:",
      error
    );

    return NextResponse.json(
      {
        message:
          "관리자 데이터를 불러오지 못했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: Request
) {
  try {
    const adminUser =
      await checkAdmin(request);

    if (!adminUser) {
      return NextResponse.json(
        {
          message:
            "관리자 권한이 없습니다.",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      await request.json();

    const {
      orderId,
      status,
    } = body;

    const allowedStatuses = [
      "READY",
      "PAID",
      "DONE",
      "SHIPPING",
      "DELIVERED",
      "CANCELLED",
    ];

    if (
      !orderId ||
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        {
          message:
            "잘못된 주문 상태입니다.",
        },
        {
          status: 400,
        }
      );
    }

    const supabaseAdmin =
      createAdminClient();

    const { data, error } =
      await supabaseAdmin
        .from("orders")
        .update({
          status,
        })
        .eq("id", orderId)
        .select()
        .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      order: data,
    });
  } catch (error) {
    console.error(
      "주문 상태 변경 오류:",
      error
    );

    return NextResponse.json(
      {
        message:
          "주문 상태 변경에 실패했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}