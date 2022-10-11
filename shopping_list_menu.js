const categories = [
  {
    code: 'fruits',
    name: "🍎 Frutas",
    items: [
      {
        code: 'apples',
        name: "🍎 Manzanas",
      },
      {
        code: 'grapes',
        name: "🍇 Uvas",
      },
      {
        code: 'banana',
        name: "🍌 Plátanos",
      },
    ]
  },
  {
    code: 'vegetables',
    name: "🥬 Verduras",
    items: [
      {
        code: 'tomato',
        name: "🍅 Tomate",
      },
      {
        code: 'lettuce',
        name: "🥬 Lechuga",
      },
    ]
  },
  {
    code: 'meat_and_fish',
    name: "🍗 Carne y pescado",
    items: [
      {
        code: 'chicken',
        name: "🍗 Pollo",
      },
      {
        code: 'seabass',
        name: "🐟 Lubina",
      },
    ]
  }
];

const categoriesByCode = {};

categories.forEach(category => {
  categoriesByCode[category.code] = category;

  category.itemsByCode = {};
  category.items.forEach(item => {
    category.itemsByCode[item.code] = item;
  });
});

module.exports = {
  categories: categories,
  categoriesByCode: categoriesByCode,
}
