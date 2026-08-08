/**
 * Food Image Auto-Detection System
 *
 * Maps food names / keywords → the best matching pre-generated image.
 * Used both on the donation form (live preview) and as a fallback when
 * an image_url is not explicitly provided.
 */

// ---------------------------------------------------------------------------
// Library of pre-generated food images stored in /public
// Each entry lists keywords that trigger this image.
// ---------------------------------------------------------------------------
export const FOOD_IMAGE_LIBRARY: {
  path: string;
  keywords: string[];
  foodTypes: string[];
  label: string;
}[] = [
  {
    path: "/food-gujarati-thali.png",
    label: "Gujarati Thali",
    keywords: ["thali", "gujarati thali", "rotli", "shaak", "full meal", "lunch thali", "dinner thali", "complete meal"],
    foodTypes: ["cooked_meal"],
  },
  {
    path: "/food-kathiyawadi.png",
    label: "Kathiyawadi / Regional",
    keywords: ["kathiyawadi", "bajra", "bajri", "rotlo", "sev tameta", "undhiyu", "village food", "desi"],
    foodTypes: ["cooked_meal"],
  },
  {
    path: "/food-dal-dhokli.png",
    label: "Dal / Khichdi",
    keywords: ["dal", "khichdi", "kadhi", "dal dhokli", "dal rice", "dal fry", "moong dal", "toor dal", "jeera rice", "plain rice"],
    foodTypes: ["cooked_meal"],
  },
  {
    path: "/food-dhokla-farsan.png",
    label: "Farsan / Snacks",
    keywords: ["dhokla", "farsan", "khaman", "snack", "samosa", "chakli", "fafda", "jalebi", "khandvi", "patra"],
    foodTypes: ["bakery", "cooked_meal"],
  },
  {
    path: "/food-upma-dhokla.png",
    label: "Breakfast",
    keywords: ["breakfast", "upma", "poha", "idli", "dosa", "morning meal", "suji", "rawa"],
    foodTypes: ["cooked_meal"],
  },
  {
    path: "/food-paneer-naan.png",
    label: "Paneer Dishes",
    keywords: ["paneer", "makhani", "butter masala", "paneer masala", "shahi paneer", "palak paneer", "kadai paneer", "naan", "kulcha"],
    foodTypes: ["cooked_meal"],
  },
  {
    path: "/food-puri-bhaji.png",
    label: "Puri Bhaji & Sweets",
    keywords: ["puri", "bhaji", "shrikhand", "pav bhaji", "chole bhature", "poori", "halwa", "sweet"],
    foodTypes: ["cooked_meal", "bakery"],
  },
  {
    path: "/food-wedding-buffet.png",
    label: "Wedding Buffet",
    keywords: ["wedding", "buffet", "banquet", "catering", "sabzi", "mixed curry", "sabji", "gravy", "bulk", "feast"],
    foodTypes: ["cooked_meal"],
  },
  {
    path: "/food-produce.png",
    label: "Fresh Vegetables",
    keywords: ["vegetable", "vegetables", "produce", "crates", "sabzi", "fresh veg", "greens", "mango", "fruit", "fruits", "salad"],
    foodTypes: ["produce"],
  },
  {
    path: "/food-chaas.png",
    label: "Dairy / Beverages",
    keywords: ["milk", "dairy", "chaas", "buttermilk", "lassi", "dahi", "curd", "yogurt", "paneer (raw)", "cheese", "beverage"],
    foodTypes: ["dairy", "beverage"],
  },
  {
    path: "/food-snacks.png",
    label: "Packaged / Dry Goods",
    keywords: ["packaged", "packet", "packets", "dry goods", "biscuit", "bread", "bakery", "rusk", "roti", "pav", "bun", "biscuits", "cookies"],
    foodTypes: ["packaged", "dry_goods", "bakery"],
  },
];

// ---------------------------------------------------------------------------
// Core detection function
// ---------------------------------------------------------------------------

/**
 * Given a food name (and optionally the food_type category), returns the
 * best-matching image path from the library. Falls back to a category-based
 * match, then to the first library entry.
 */
export function detectFoodImage(
  foodName: string,
  foodType?: string,
): string {
  const name = foodName.toLowerCase().trim();

  // 1. Keyword match on name (score by number of keywords hit)
  let best: { path: string; score: number } | null = null;

  for (const entry of FOOD_IMAGE_LIBRARY) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (name.includes(kw)) {
        // Longer keyword = more specific = higher score
        score += kw.length;
      }
    }
    if (score > 0 && (best === null || score > best.score)) {
      best = { path: entry.path, score };
    }
  }

  if (best) return best.path;

  // 2. Fallback: match by food_type category
  if (foodType) {
    const byType = FOOD_IMAGE_LIBRARY.find((e) =>
      e.foodTypes.includes(foodType),
    );
    if (byType) return byType.path;
  }

  // 3. Ultimate fallback
  return FOOD_IMAGE_LIBRARY[0].path;
}

/** All image paths from the library (for the picker grid). */
export const ALL_FOOD_IMAGES = FOOD_IMAGE_LIBRARY.map((e) => ({
  path: e.path,
  label: e.label,
}));
