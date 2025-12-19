const express = require('express');
const dayjs = require('dayjs');

const app = express();
app.use(express.json());

const coupons = []; 
let usageCounts = {}; 
const seedUsers = [

  { email: 'hire-me@anshumat.org', password: 'HireMe@2025!', userId: 'demo-user-1', userTier: 'NEW', country: 'IN', lifetimeSpend: 0, ordersPlaced: 0 }
];


function isWithinDates(startDate, endDate) {
  const now = dayjs();
  const start = dayjs(startDate);
  const end = dayjs(endDate).endOf('day');
  return now.isAfter(start.subtract(1, 'day')) && now.isBefore(end.add(1, 'day'));
}


function computeCartValue(cart) {
  if (!cart || !Array.isArray(cart.items)) return 0;
  return cart.items.reduce((s, it) => s + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 0), 0);
}


function validateCoupon(c) {
  if (!c.code) return 'code required';
  if (!c.discountType || !['FLAT', 'PERCENT'].includes(c.discountType)) return 'discountType must be FLAT or PERCENT';
  if (typeof c.discountValue !== 'number' && typeof c.discountValue !== 'string') return 'discountValue must be a number';
  if (!c.startDate || !c.endDate) return 'startDate and endDate required';
  return null;
}

// Create coupon API
app.post('/coupons', (req, res) => {
  const coupon = req.body;
  const err = validateCoupon(coupon);
  if (err) return res.status(400).json({ error: err });


  const exists = coupons.find(c => c.code === coupon.code);
  if (exists) {
    return res.status(400).json({ error: 'Coupon code already exists' });
  }


  coupon.discountValue = Number(coupon.discountValue);
  if (coupon.maxDiscountAmount) coupon.maxDiscountAmount = Number(coupon.maxDiscountAmount);

  coupons.push(coupon);
  return res.status(201).json({ success: true, coupon });
});


app.get('/coupons', (req, res) => {
  res.json(coupons);
});

// Best coupon API
app.post('/best-coupon', (req, res) => {
  const { user, cart } = req.body;
  if (!user || !cart) return res.status(400).json({ error: 'user and cart required' });

  const cartValue = computeCartValue(cart);

  const eligibleResults = [];

  for (const c of coupons) {
   
    if (!isWithinDates(c.startDate, c.endDate)) continue;

    
    const userUsage = (usageCounts[user.userId] && usageCounts[user.userId][c.code]) || 0;
    if (c.usageLimitPerUser && userUsage >= c.usageLimitPerUser) continue;

    
    const e = c.eligibility || {};
    
    if (e.allowedUserTiers && e.allowedUserTiers.length && (!user.userTier || !e.allowedUserTiers.includes(user.userTier))) continue;
    if (e.minLifetimeSpend && (user.lifetimeSpend || 0) < e.minLifetimeSpend) continue;
    if (e.minOrdersPlaced && (user.ordersPlaced || 0) < e.minOrdersPlaced) continue;
    if (e.firstOrderOnly && (user.ordersPlaced || 0) > 0) continue;
    if (e.allowedCountries && e.allowedCountries.length && (!user.country || !e.allowedCountries.includes(user.country))) continue;

    
    if (e.minCartValue && cartValue < e.minCartValue) continue;
    if (e.minItemsCount) {
      const itemCount = cart.items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
      if (itemCount < e.minItemsCount) continue;
    }
    if (e.applicableCategories && e.applicableCategories.length) {
      const hasApplicable = cart.items.some(it => e.applicableCategories.includes(it.category));
      if (!hasApplicable) continue;
    }
    if (e.excludedCategories && e.excludedCategories.length) {
      const hasExcluded = cart.items.some(it => e.excludedCategories.includes(it.category));
      if (hasExcluded) continue;
    }

    
    let discount = 0;
    if (c.discountType === 'FLAT') discount = Number(c.discountValue);
    else if (c.discountType === 'PERCENT') {
      discount = (Number(c.discountValue) / 100) * cartValue;
      if (c.maxDiscountAmount) discount = Math.min(discount, Number(c.maxDiscountAmount));
    }
    discount = Math.round(discount * 100) / 100;

    eligibleResults.push({
      coupon: c,
      discount,
      endDate: dayjs(c.endDate)
    });
  }

  if (eligibleResults.length === 0) return res.json({ bestCoupon: null });


  eligibleResults.sort((a, b) => {
    if (b.discount !== a.discount) return b.discount - a.discount;
    if (!a.endDate.isSame(b.endDate)) return a.endDate.isBefore(b.endDate) ? -1 : 1;
    return a.coupon.code.localeCompare(b.coupon.code);
  });

  const best = eligibleResults[0];

  return res.json({
    bestCoupon: {
      code: best.coupon.code,
      description: best.coupon.description,
      discount: best.discount,
      discountType: best.coupon.discountType
    }
  });
});


app.post('/apply-coupon', (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) return res.status(400).json({ error: 'userId and code required' });

  const coupon = coupons.find(c => c.code === code);
  if (!coupon) return res.status(404).json({ error: 'coupon not found' });

  usageCounts[userId] = usageCounts[userId] || {};
  usageCounts[userId][code] = (usageCounts[userId][code] || 0) + 1;

  res.json({ success: true, usage: usageCounts[userId][code] });
});


app.post('/seed', (req, res) => {
  coupons.length = 0;
  usageCounts = {};
  // sample coupon
  coupons.push({
    code: 'WELCOME100',
    description: '₹100 off for new users',
    discountType: 'FLAT',
    discountValue: 100,
    startDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
    usageLimitPerUser: 1,
    eligibility: { firstOrderOnly: true, allowedUserTiers: ['NEW'] }
  });
  res.json({ seeded: true, coupons });
});


app.get('/', (req, res) => res.send('Coupon service running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
