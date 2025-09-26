// Массив объектов с информацией о блюдах
const dishes = [
	{
		keyword: 'tom_yam',
		name: 'Суп Том-Ям',
		price: 350,
		category: 'soup',
		count: '400 г',
		image: 'images/ricesoup.jpg',
	},
	{
		keyword: 'mushroom_soup',
		name: 'Грибной суп',
		price: 300,
		category: 'soup',
		count: '350 г',
		image: 'images/mushroomsoup.jpg',
	},
	{
		keyword: 'sea_soup',
		name: 'Суп с морепродуктами',
		price: 450,
		category: 'soup',
		count: '300 г',
		image: 'images/seasoup.jpg',
	},
	{
		keyword: 'beef_steak',
		name: 'Мраморный стейк из говядины',
		price: 700,
		category: 'main_dish',
		count: '300 г',
		image: 'images/beaf.jpg',
	},
	{
		keyword: 'pasta_bacon',
		name: 'Паста с беконом, сыром и грибами',
		price: 300,
		category: 'main_dish',
		count: '250 г',
		image: 'images/pasta.jpg',
	},
	{
		keyword: 'potato_baked',
		name: 'Запеченный картофель с кусочками сала',
		price: 400,
		category: 'main_dish',
		count: '250 г',
		image: 'images/potato.jpg',
	},
	{
		keyword: 'fruit_juice',
		name: 'Сок на выбор',
		price: 200,
		category: 'drink',
		count: '300 мл',
		image: 'images/juice.jpg',
	},
	{
		keyword: 'coffee_cookie',
		name: 'Кофе на выбор с кусочками печенья',
		price: 250,
		category: 'drink',
		count: '250 мл',
		image: 'images/coffee.jpg',
	},
	{
		keyword: 'soda',
		name: 'Газировка на выбор',
		price: 200,
		category: 'drink',
		count: '300 мл',
		image: 'images/soda.jpg',
	},
]

// Сортировка блюд по алфавиту
dishes.sort((a, b) => a.name.localeCompare(b.name))

// Экспортируем массив для использования в других скриптах
export default dishes
