/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.on('/').render('pages/home')
router.get('/home', async ({ view }) => view.render('pages/home'))
router.get('/shop', async ({ view }) => view.render('pages/shop'))
router.get('/product', async ({ view }) => view.render('pages/product'))
router.get('/cart', async ({ view }) => view.render('pages/cart'))
router.get('/about', async ({ view }) => view.render('pages/about'))
router.get('/success', async ({ view }) => view.render('pages/success'))
router.get('/login-seller', async ({ view }) => view.render('pages/login_seller'))
router.get('/seller-dashboard', async ({ view }) => view.render('pages/seller_dashboard'))
router.get('/transactions', async ({ view }) => view.render('pages/transactions'))
router.get('/wishlist', async ({ view }) => view.render('pages/wishlist'))
