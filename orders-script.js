import { dishes, loadDishes } from './utils.js'

// Глобальные переменные
let allOrders = []
let currentlyEditingOrderId = null

// --- DOM-элементы ---
const ordersContainer = document.getElementById('orders-container')
const modalBackdrop = document.getElementById('modal-backdrop')

// Модальное окно "Подробнее"
const detailsModal = document.getElementById('details-modal')
const detailsModalBody = document.getElementById('details-modal-body')
const detailsOkBtn = document.getElementById('details-ok-btn')
const detailsCloseBtn = detailsModal.querySelector('.close-button')

// Модальное окно "Редактирование"
const editModal = document.getElementById('edit-modal')
const editForm = document.getElementById('edit-form')
const editSaveBtn = document.getElementById('edit-save-btn')
const editCancelBtn = document.getElementById('edit-cancel-btn')
const editCloseBtn = editModal.querySelector('.close-button')

// Модальное окно "Удаление"
const deleteModal = document.getElementById('delete-modal')
const deleteConfirmBtn = document.getElementById('delete-confirm-btn')
const deleteCancelBtn = document.getElementById('delete-cancel-btn')
const deleteCloseBtn = deleteModal.querySelector('.close-button')

// --- Функции для работы с localStorage ---

function loadOrdersFromLocalStorage() {
	const savedOrders = localStorage.getItem('allOrders')
	return savedOrders ? JSON.parse(savedOrders) : []
}

function saveOrdersToLocalStorage() {
	localStorage.setItem('allOrders', JSON.stringify(allOrders))
}

// --- Функции для модальных окон ---

function openModal(modal) {
	modal.style.display = 'block'
	modalBackdrop.style.display = 'block'
}

function closeModal(modal) {
	modal.style.display = 'none'
	modalBackdrop.style.display = 'none'
}

// --- Логика отображения заказов ---

function renderOrders() {
	ordersContainer.innerHTML = ''
	if (allOrders.length === 0) {
		ordersContainer.innerHTML =
			'<tr><td colspan="6">У вас еще нет заказов.</td></tr>'
		return
	}

	const sortedOrders = [...allOrders].sort(
		(a, b) => new Date(b.date) - new Date(a.date)
	)

	sortedOrders.forEach((order, index) => {
		const tr = document.createElement('tr')
		tr.dataset.orderId = order.id

		const dishNames = order.dishes
			.map(keyword => {
				const dish = dishes.find(d => d.keyword === keyword)
				return dish ? dish.name : 'Неизвестное блюдо'
			})
			.join(', ')

		const totalCost = order.dishes.reduce((sum, keyword) => {
			const dish = dishes.find(d => d.keyword === keyword)
			return sum + (dish ? dish.price : 0)
		}, 0)

		const deliveryTime =
			order['delivery-time'] === 'time' && order['specific-time']
				? order['specific-time']
				: 'Как можно скорее (с 7:00 до 23:00)'

		tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${new Date(order.date).toLocaleDateString()} ${new Date(
			order.date
		).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            <td>${dishNames}</td>
            <td>${totalCost} ₽</td>
            <td>${deliveryTime}</td>
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

// --- Функциональность кнопок действий ---

function showDetails(orderId) {
	const order = allOrders.find(o => o.id === orderId)
	if (!order) return

	const dishDetails = order.dishes
		.map(keyword => {
			const dish = dishes.find(d => d.keyword === keyword)
			return `<li>${dish ? dish.name : 'Неизвестное блюдо'} - ${
				dish ? dish.price : 0
			} ₽</li>`
		})
		.join('')

	const totalCost = order.dishes.reduce((sum, keyword) => {
		const dish = dishes.find(d => d.keyword === keyword)
		return sum + (dish ? dish.price : 0)
	}, 0)

	const deliveryTime =
		order['delivery-time'] === 'time' && order['specific-time']
			? order['specific-time']
			: 'Как можно скорее (с 7:00 до 23:00)'

	detailsModalBody.innerHTML = `
        <p><strong>ID заказа:</strong> ${order.id}</p>
        <p><strong>Дата:</strong> ${new Date(
					order.date
				).toLocaleDateString()} ${new Date(order.date).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
	})}</p>
        <p><strong>Имя:</strong> ${order.name}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>Телефон:</strong> ${order.phone}</p>
        <p><strong>Адрес:</strong> ${order.address}</p>
        <p><strong>Время доставки:</strong> ${deliveryTime}</p>
        <p><strong>Состав заказа:</strong></p>
        <ul>${dishDetails}</ul>
        <p><strong>Итоговая стоимость:</strong> ${totalCost} ₽</p>
    `
	openModal(detailsModal)
}

function showEditForm(orderId) {
	const order = allOrders.find(o => o.id === orderId)
	if (!order) return
	currentlyEditingOrderId = orderId

	editForm.innerHTML = `
        <input type="hidden" name="id" value="${order.id}">
        <div>
            <label for="edit-name">Имя:</label>
            <input type="text" id="edit-name" name="name" value="${
							order.name || ''
						}" required>
        </div>
        <div>
            <label for="edit-email">Email:</label>
            <input type="email" id="edit-email" name="email" value="${
							order.email || ''
						}" required>
        </div>
        <div>
            <label for="edit-phone">Телефон:</label>
            <input type="tel" id="edit-phone" name="phone" value="${
							order.phone || ''
						}" required>
        </div>
        <div>
            <label for="edit-address">Адрес доставки:</label>
            <input type="text" id="edit-address" name="address" value="${
							order.address || ''
						}" required>
        </div>
        <div>
            <label for="edit-delivery-time">Время доставки:</label>
            <select id="edit-delivery-time" name="delivery-time">
                <option value="asap" ${
									order['delivery-time'] === 'asap' ? 'selected' : ''
								}>Как можно скорее</option>
                <option value="time" ${
									order['delivery-time'] === 'time' ? 'selected' : ''
								}>Ко времени</option>
            </select>
        </div>
        <div id="edit-specific-time-container" style="display: ${
					order['delivery-time'] === 'time' ? 'block' : 'none'
				};">
            <label for="edit-specific-time">Выберите время:</label>
            <select id="edit-specific-time" name="specific-time">
                <option value="">Время доставки</option>
                <option value="12:00" ${
									order['specific-time'] === '12:00' ? 'selected' : ''
								}>12:00</option>
                <option value="12:30" ${
									order['specific-time'] === '12:30' ? 'selected' : ''
								}>12:30</option>
                <option value="13:00" ${
									order['specific-time'] === '13:00' ? 'selected' : ''
								}>13:00</option>
                <option value="13:30" ${
									order['specific-time'] === '13:30' ? 'selected' : ''
								}>13:30</option>
                <option value="14:00" ${
									order['specific-time'] === '14:00' ? 'selected' : ''
								}>14:00</option>
                <option value="14:30" ${
									order['specific-time'] === '14:30' ? 'selected' : ''
								}>14:30</option>
                <option value="15:00" ${
									order['specific-time'] === '15:00' ? 'selected' : ''
								}>15:00</option>
                <option value="15:30" ${
									order['specific-time'] === '15:30' ? 'selected' : ''
								}>15:30</option>
                <option value="16:00" ${
									order['specific-time'] === '16:00' ? 'selected' : ''
								}>16:00</option>
                <option value="16:30" ${
									order['specific-time'] === '16:30' ? 'selected' : ''
								}>16:30</option>
                <option value="17:00" ${
									order['specific-time'] === '17:00' ? 'selected' : ''
								}>17:00</option>
                <option value="17:30" ${
									order['specific-time'] === '17:30' ? 'selected' : ''
								}>17:30</option>
                <option value="18:00" ${
									order['specific-time'] === '18:00' ? 'selected' : ''
								}>18:00</option>
                <option value="18:30" ${
									order['specific-time'] === '18:30' ? 'selected' : ''
								}>18:30</option>
                <option value="19:00" ${
									order['specific-time'] === '19:00' ? 'selected' : ''
								}>19:00</option>
                <option value="19:30" ${
									order['specific-time'] === '19:30' ? 'selected' : ''
								}>19:30</option>
                <option value="20:00" ${
									order['specific-time'] === '20:00' ? 'selected' : ''
								}>20:00</option>
            </select>
        </div>
    `

	const deliveryTimeSelect = editForm.querySelector('#edit-delivery-time')
	const specificTimeContainer = editForm.querySelector(
		'#edit-specific-time-container'
	)

	if (deliveryTimeSelect && specificTimeContainer) {
		deliveryTimeSelect.addEventListener('change', event => {
			specificTimeContainer.style.display =
				event.target.value === 'time' ? 'block' : 'none'
		})
	}

	openModal(editModal)
}

function showDeleteConfirmation(orderId) {
	deleteConfirmBtn.dataset.orderId = orderId
	openModal(deleteModal)
}

function handleEditSubmit(event) {
	event.preventDefault()
	const formData = new FormData(editForm)
	const updatedData = Object.fromEntries(formData.entries())

	try {
		const orderIndex = allOrders.findIndex(o => o.id == currentlyEditingOrderId)
		if (orderIndex !== -1) {
			const originalOrder = allOrders[orderIndex]

			const updatedOrder = {
				...originalOrder,
				name: updatedData.name,
				email: updatedData.email,
				phone: updatedData.phone,
				address: updatedData.address,
				'delivery-time': updatedData['delivery-time'],
				'specific-time':
					updatedData['delivery-time'] === 'time'
						? updatedData['specific-time']
						: null,
			}

			allOrders[orderIndex] = updatedOrder

			saveOrdersToLocalStorage()
			renderOrders()
			closeModal(editModal)
			showAlert('Заказ успешно изменён.')
		} else {
			throw new Error('Заказ для обновления не найден.')
		}
	} catch (error) {
		console.error('Ошибка при редактировании заказа:', error)
		showAlert(`Произошла ошибка: ${error.message}`, 'error')
	}
}

function handleDeleteConfirm() {
	const orderId = deleteConfirmBtn.dataset.orderId

	allOrders = allOrders.filter(o => o.id != orderId)
	saveOrdersToLocalStorage()
	renderOrders()
	closeModal(deleteModal)
	showAlert('Заказ успешно удалён.')
}

// --- Уведомления ---
function showAlert(message, type = 'success') {
	const alertBox = document.createElement('div')
	alertBox.className = `alert ${type}`
	alertBox.textContent = message
	document.body.appendChild(alertBox)
	setTimeout(() => {
		alertBox.remove()
	}, 3000)
}

// --- Инициализация и обработчики событий ---

document.addEventListener('DOMContentLoaded', async () => {
	await loadDishes()
	allOrders = loadOrdersFromLocalStorage()
	renderOrders()

	// Закрытие модальных окон
	detailsOkBtn.addEventListener('click', () => closeModal(detailsModal))
	detailsCloseBtn.addEventListener('click', () => closeModal(detailsModal))
	editCancelBtn.addEventListener('click', () => closeModal(editModal))
	editCloseBtn.addEventListener('click', () => closeModal(editModal))
	deleteCancelBtn.addEventListener('click', () => closeModal(deleteModal))
	deleteCloseBtn.addEventListener('click', () => closeModal(deleteModal))
	modalBackdrop.addEventListener('click', () => {
		closeModal(detailsModal)
		closeModal(editModal)
		closeModal(deleteModal)
	})

	// Обработчики форм и кнопок
	editSaveBtn.addEventListener('click', handleEditSubmit)
	deleteConfirmBtn.addEventListener('click', handleDeleteConfirm)
})
