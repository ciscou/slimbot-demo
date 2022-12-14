const categories = [
  {
    code: 'fruits',
    name: "π Frutas",
    items: [
      {
        code: 'apples',
        name: "π Manzanas",
      },
      {
        code: 'grapes',
        name: "π Uvas",
      },
      {
        code: 'banana',
        name: "π PlΓ‘tanos",
      },
    ]
  },
  {
    code: 'vegetables',
    name: "π₯¬ Verduras",
    items: [
      {
        code: 'tomato',
        name: "π Tomate",
      },
      {
        code: 'lettuce',
        name: "π₯¬ Lechuga",
      },
    ]
  },
  {
    code: 'meat_and_fish',
    name: "π Carne y pescado",
    items: [
      {
        code: 'chicken',
        name: "π Pollo",
      },
      {
        code: 'seabass',
        name: "π Lubina",
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
