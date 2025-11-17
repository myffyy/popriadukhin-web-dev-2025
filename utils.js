export let dishes = []

export const combos = [
	{ categories: ['soup', 'main-course', 'salad', 'drink'] },
	{ categories: ['soup', 'main-course', 'drink'] },
	{ categories: ['soup', 'drink'] },
	{ categories: ['main-course', 'salad', 'drink'] },
	{ categories: ['main-course', 'drink'] },
	{ categories: ['salad', 'drink'] },
]

export async function loadDishes() {
	if (dishes.length > 0) return
	try {
		const response = await fetch(
			'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes'
		)
		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
		dishes.splice(0, dishes.length, ...(await response.json()))
	} catch (error) {
		console.error('Ошибка при загрузке данных о блюдах:', error)
	}
}

export function createElement(tag, attributes = {}, ...children) {
	const element = document.createElement(tag)
	Object.assign(element, attributes)
	if (children.length > 0) {
		element.append(...children.filter(c => c))
	}
	return element
}

export function checkCombo(selectedDishes) {
	const selectedCategories = Object.keys(selectedDishes).filter(
		category => selectedDishes[category] && category !== 'dessert'
	)
	const selectedSet = new Set(selectedCategories)

	for (const combo of combos) {
		const comboSet = new Set(combo.categories)
		if (
			selectedSet.size === comboSet.size &&
			[...selectedSet].every(cat => comboSet.has(cat))
		) {
			return { isCombo: true, message: 'Комбо собрано!' }
		}
	}

	return {
		isCombo: false,
		message: 'Выбранные блюда не соответствуют ни одному комбо.',
	}
}

export function saveToStorage(key, data) {
	localStorage.setItem(key, JSON.stringify(data))
}

export function loadFromStorage(key) {
	const data = localStorage.getItem(key)
	return data ? JSON.parse(data) : null
}

export function createDishCard(dish, buttonText, onButtonClick) {
	const img = createElement('img', { src: dish.image, alt: dish.name })
	const price = createElement('p', {
		className: 'price',
		textContent: `${dish.price} ₽`,
	})
	const name = createElement('p', {
		className: 'dish-name',
		textContent: dish.name,
	})
	const weight = createElement('p', {
		className: 'weight',
		textContent: dish.count,
	})
	const button = createElement('button', {
		textContent: buttonText,
		onclick: onButtonClick,
	})

	const dishItem = createElement(
		'div',
		{ className: 'dish-item' },
		img,
		price,
		name,
		weight,
		button
	)
	dishItem.dataset.dish = dish.keyword
	return dishItem
}
