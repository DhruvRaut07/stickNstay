import "server-only";
import { DEFAULT_PRICES, parsePrices, type Prices } from "./rules";
import { supabaseAdmin } from "./supabase";

/** Live prices from the `settings` table, the same values the order functions charge. */
export async function getPrices(): Promise<Prices> {
  const { data, error } = await supabaseAdmin()
    .from("settings")
    .select("key, value")
    .in("key", ["price_basic", "price_custom"]);
  if (error) {
    // Showing the default beats a broken page, but it can differ from what is charged, so log loudly.
    console.error("Could not load prices from settings, showing defaults", error);
    return DEFAULT_PRICES;
  }
  return parsePrices(data);
}
