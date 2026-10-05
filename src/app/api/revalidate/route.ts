import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

const paths = ["/", "/shop", "/about", "/find-us", "/contact"];

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { message: "SANITY_REVALIDATE_SECRET is not configured" },
      { status: 500 },
    );
  }

  const { isValidSignature } = await parseBody(request, secret);

  if (!isValidSignature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, paths });
}
