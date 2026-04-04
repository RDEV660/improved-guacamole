import { cloverTokenBaseUrl, getCloverPakmsKey } from "@/lib/clover-config";

export const runtime = "nodejs";

type CardBody = {
  number: string;
  exp_month: string;
  exp_year: string;
  cvv: string;
  brand?: string;
};

/**
 * Proxies card tokenization to Clover (sandbox or production).
 * For lowest PCI scope in production, prefer Clover-hosted fields / official SDK
 * so card data never touches your server — keep this route for demos and migration.
 */
export async function POST(req: Request) {
  const pakms = getCloverPakmsKey();
  if (!pakms) {
    return Response.json(
      {
        error:
          "Clover PAKMS key missing. Set CLOVER_PAKMS_KEY (or NEXT_PUBLIC_CLOVER_PAKMS_KEY for client-only token flows).",
      },
      { status: 503 }
    );
  }

  let body: { card?: CardBody };
  try {
    body = (await req.json()) as { card?: CardBody };
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const card = body.card;
  if (!card?.number || !card.exp_month || !card.exp_year || !card.cvv) {
    return Response.json({ error: "card.number, exp_month, exp_year, and cvv are required." }, { status: 400 });
  }

  const url = `${cloverTokenBaseUrl()}/v1/tokens`;
  const upstream = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      apikey: pakms,
    },
    body: JSON.stringify({
      card: {
        number: card.number.replace(/\s/g, ""),
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        cvv: card.cvv,
        ...(card.brand ? { brand: card.brand } : {}),
      },
    }),
  });

  const text = await upstream.text();
  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    data = { raw: text };
  }

  if (!upstream.ok) {
    return Response.json(
      { error: "Clover tokenization failed.", cloverStatus: upstream.status, details: data },
      { status: 502 }
    );
  }

  return Response.json(data);
}
