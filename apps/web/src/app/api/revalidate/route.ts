import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

const REVALIDATION_SECRET =
  process.env.REVALIDATION_SECRET_TOKEN || "sch_revalidation_secret_2026_silchar";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    let token = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Body may be empty
    }

    if (!token && body?.token) {
      token = String(body.token).trim();
    }

    if (!token || token !== REVALIDATION_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid revalidation token" },
        { status: 401 }
      );
    }

    const revalidatedItems: string[] = [];

    // Tag-based revalidation (clears unstable_cache for all doctor queries)
    const tag = body?.tag || "doctors";
    revalidateTag(tag, "default");
    revalidatedItems.push(`tag:${tag}`);

    // Path-based revalidation for listing
    revalidatePath("/doctors");
    revalidatedItems.push("path:/doctors");

    // Homepage also highlights doctors
    revalidatePath("/");
    revalidatedItems.push("path:/");

    // Dynamic doctor profile path if slug provided
    if (body?.slug) {
      const doctorPath = `/doctors/${body.slug}`;
      revalidatePath(doctorPath);
      revalidatedItems.push(`path:${doctorPath}`);
    }

    // Dynamic department path if departmentSlug provided
    if (body?.departmentSlug) {
      const deptPath = `/departments/${body.departmentSlug}`;
      revalidatePath(deptPath);
      revalidatedItems.push(`path:${deptPath}`);
    }

    // Refresh XML sitemap and AI LLM manifests
    revalidatePath("/sitemap.xml");
    revalidatedItems.push("path:/sitemap.xml");
    revalidatePath("/llms.txt");
    revalidatedItems.push("path:/llms.txt");
    revalidatePath("/llms-full.txt");
    revalidatedItems.push("path:/llms-full.txt");

    // Optional IndexNow Instant Search Engine ping (Bing, Yandex, Naver)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://southcityhospital.in";
    const indexNowKey = process.env.INDEXNOW_KEY;
    if (indexNowKey && body?.slug) {
      const targetUrls = [
        `${siteUrl}/doctors/${body.slug}`,
        `${siteUrl}/doctors`,
        `${siteUrl}/sitemap.xml`,
      ];
      try {
        const hostName = new URL(siteUrl).hostname;
        fetch("https://api.indexnow.org/indexnow", {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            host: hostName,
            key: indexNowKey,
            keyLocation: `${siteUrl}/${indexNowKey}.txt`,
            urlList: targetUrls,
          }),
        }).catch(() => {});
      } catch {
        // Non-blocking
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cache successfully revalidated",
      revalidated: revalidatedItems,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Revalidation error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to revalidate" },
      { status: 500 }
    );
  }
}
