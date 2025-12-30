import { dishes, loadDishes, loadFromStorage, saveToStorage } from './utils.js'

let allOrders = []
let currentlyEditingOrderId = null
let detailsModal, editModal, deleteModal

const ordersContainer = document.getElementById('orders-container')

function getDishInfo(keyword) {
	const dish = dishes.find(d => d.keyword === keyword)
	return {
		name: dish ? dish.name : 'Неизвестное блюдо',
		price: dish ? dish.price : 0,
	}
}

function formatDateTime(date) {
	const d = new Date(date)
	return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
	})}`
}

function getDeliveryTime(order) {
	return order['delivery-time'] === 'time' && order['specific-time']
		? order['specific-time']
		: 'Как можно скорее (с 7:00 до 23:00)'
}

function calculateTotal(dishKeywords) {
	return dishKeywords.reduce(
		(sum, keyword) => sum + getDishInfo(keyword).price,
		0
	)
}

function renderOrders() {
	if (allOrders.length === 0) {
		ordersContainer.innerHTML =
			'<tr><td colspan="6">У вас еще нет заказов.</td></tr>'
		return
	}

	ordersContainer.innerHTML = ''
	const sortedOrders = [...allOrders].sort(
		(a, b) => new Date(b.date) - new Date(a.date)
	)

	sortedOrders.forEach((order, index) => {
		const tr = document.createElement('tr')
		tr.dataset.orderId = order.id

		const dishNames = order.dishes
			.map(keyword => getDishInfo(keyword).name)
			.join(', ')
		const totalCost = calculateTotal(order.dishes)

		tr.innerHTML = `
			<td>${index + 1}</td>
			<td>${formatDateTime(order.date)}</td>
			<td>${dishNames}</td>
			<td>${totalCost} ₽</td>
			<td>${getDeliveryTime(order)}</td>
			<td class="order-actions">
				<button class="action-btn details-btn"><i class="bi bi-eye"></i></button>
				<button class="action-btn edit-btn"><i class="bi bi-pencil"></i></button>
				<button class="action-btn delete-btn"><i class="bi bi-trash"></i></button>
			</td>
		`

		tr.querySelector('.details-btn').addEventListener('click', () =>
			showDetails(order.id)
		)
		tr.querySelector('.edit-btn').addEventListener('click', () =>
			showEditForm(order.id)
		)
		tr.querySelector('.delete-btn').addEventListener('click', () =>
			showDeleteConfirmation(order.id)
		)

		ordersContainer.appendChild(tr)
	})
}

function showDetails(orderId) {
	const order = allOrders.find(o => o.id === orderId)
	if (!order) return

	const dishDetails = order.dishes
		.map(keyword => {
			const { name, price } = getDishInfo(keyword)
			return `<li>${name} - ${price} ₽</li>`
		})
		.join('')

	document.getElementById('details-modal-body').innerHTML = `
		<p><strong>ID заказа:</strong> ${order.id}</p>
		<p><strong>Дата:</strong> ${formatDateTime(order.date)}</p>
		<p><strong>Имя:</strong> ${order.name}</p>
		<p><strong>Email:</strong> ${order.email}</p>
		<p><strong>Телефон:</strong> ${order.phone}</p>
		<p><strong>Адрес:</strong> ${order.address}</p>
		<p><strong>Время доставки:</strong> ${getDeliveryTime(order)}</p>
		<p><strong>Состав заказа:</strong></p>
		<ul>${dishDetails}</ul>
		<p><strong>Итоговая стоимость:</strong> ${calculateTotal(order.dishes)} ₽</p>
	`
	detailsModal.show()
}

function createTimeOptions(selectedTime) {
	const times = [
		'12:00',
		'12:30',
		'13:00',
		'13:30',
		'14:00',
		'14:30',
		'15:00',
		'15:30',
		'16:00',
		'16:30',
		'17:00',
		'17:30',
		'18:00',
		'18:30',
		'19:00',
		'19:30',
		'20:00',
	]
	return times
		.map(
			time =>
				`<option value="${time}" ${
					selectedTime === time ? 'selected' : ''
				}>${time}</option>`
		)
		.join('')
}

function showEditForm(orderId) {
	const order = allOrders.find(o => o.id === orderId)
	if (!order) return
	currentlyEditingOrderId = orderId

	const editForm = document.getElementById('edit-form')
	editForm.innerHTML = `
		<input type="hidden" name="id" value="${order.id}">
		<div class="mb-3">
			<label for="edit-name" class="form-label">Имя:</label>
			<input type="text" id="edit-name" name="name" class="form-control" value="${
				order.name || ''
			}" required>
		</div>
		<div class="mb-3">
			<label for="edit-email" class="form-label">Email:</label>
			<input type="email" id="edit-email" name="email" class="form-control" value="${
				order.email || ''
			}" required>
		</div>
		<div class="mb-3">
			<label for="edit-phone" class="form-label">Телефон:</label>
			<input type="tel" id="edit-phone" name="phone" class="form-control" value="${
				order.phone || ''
			}" required>
		</div>
		<div class="mb-3">
			<label for="edit-address" class="form-label">Адрес доставки:</label>
			<input type="text" id="edit-address" name="address" class="form-control" value="${
				order.address || ''
			}" required>
		</div>
		<div class="mb-3">
			<label for="edit-delivery-time" class="form-label">Время доставки:</label>
			<select id="edit-delivery-time" name="delivery-time" class="form-select">
				<option value="asap" ${
					order['delivery-time'] === 'asap' ? 'selected' : ''
				}>Как можно скорее</option>
				<option value="time" ${
					order['delivery-time'] === 'time' ? 'selected' : ''
				}>Ко времени</option>
			</select>
		</div>
		<div id="edit-specific-time-container" class="mb-3" style="display: ${
			order['delivery-time'] === 'time' ? 'block' : 'none'
		};">
			<label for="edit-specific-time" class="form-label">Выберите время:</label>
			<select id="edit-specific-time" name="specific-time" class="form-select">
				<option value="">Время доставки</option>
				${createTimeOptions(order['specific-time'])}
			</select>
		</div>
	`

	editForm
		.querySelector('#edit-delivery-time')
		.addEventListener('change', e => {
			editForm.querySelector('#edit-specific-time-container').style.display =
				e.target.value === 'time' ? 'block' : 'none'
		})

	editModal.show()
}

function showDeleteConfirmation(orderId) {
	document.getElementById('delete-confirm-btn').dataset.orderId = orderId
	deleteModal.show()
}

function handleEditSubmit(event) {
	event.preventDefault()
	const updatedData = Object.fromEntries(
		new FormData(document.getElementById('edit-form'))
	)

	try {
		const orderIndex = allOrders.findIndex(o => o.id == currentlyEditingOrderId)
		if (orderIndex === -1) throw new Error('Заказ для обновления не найден.')

		allOrders[orderIndex] = {
			...allOrders[orderIndex],
			...updatedData,
			'specific-time':
				updatedData['delivery-time'] === 'time'
					? updatedData['specific-time']
					: null,
		}

		saveToStorage('allOrders', allOrders)
		renderOrders()
		editModal.hide()
		showAlert('Заказ успешно изменён.')
	} catch (error) {
		console.error('Ошибка при редактировании заказа:', error)
		showAlert(`Произошла ошибка: ${error.message}`, 'error')
	}
}

function handleDeleteConfirm() {
	const orderId = document.getElementById('delete-confirm-btn').dataset.orderId
	allOrders = allOrders.filter(o => o.id != orderId)
	saveToStorage('allOrders', allOrders)
	renderOrders()
	deleteModal.hide()
	showAlert('Заказ успешно удалён.')
}

function showAlert(message, type = 'success') {
	const alertBox = document.createElement('div')
	alertBox.className = `alert ${type}`
	alertBox.textContent = message
	document.body.appendChild(alertBox)
	setTimeout(() => alertBox.remove(), 3000)
}

document.addEventListener('DOMContentLoaded', async () => {
	await loadDishes()
	allOrders = loadFromStorage('allOrders') || []

	detailsModal = new bootstrap.Modal(document.getElementById('details-modal'))
	editModal = new bootstrap.Modal(document.getElementById('edit-modal'))
	deleteModal = new bootstrap.Modal(document.getElementById('delete-modal'))

	renderOrders()

	document
		.getElementById('edit-save-btn')
		.addEventListener('click', handleEditSubmit)
	document
		.getElementById('delete-confirm-btn')
		.addEventListener('click', handleDeleteConfirm)
})
