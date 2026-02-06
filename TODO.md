# Real-Time Updates Implementation Plan

## Backend Enhancements
- [ ] Add emit for productAdded in ProductRoutes.js
- [ ] Add emit for categoryUpdated in categoryRoutes.js
- [ ] Add emit for cartUpdated in cart remove route in cartRoutes.js
- [ ] Ensure all emits use room-based messaging where appropriate
- [ ] Add emits for dashboard stats updates when orders change (to admins)

## Frontend Listeners
- [ ] Add socket listeners in UserPage.vue for product/category/cart updates
- [ ] Add socket listeners in AdminPage.vue for dashboard stats and notifications
- [ ] Add socket listeners in ProductList.vue for product updates
- [ ] Add socket listeners in OrdersPage.vue for order updates
- [ ] Add socket listeners in CartPage.vue for cart updates
- [ ] Add socket listeners in WalletPage.vue for wallet updates

## Server Enhancements
- [ ] Modify server.js to join admins into an 'admin' room for targeted broadcasts

## Testing
- [ ] Test real-time updates across all components
- [ ] Ensure no duplicate emits or listeners
