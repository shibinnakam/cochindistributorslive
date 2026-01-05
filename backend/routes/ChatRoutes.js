const express = require('express');
const router = express.Router();
const manager = require('../chatbotManager');
const Product = require('../models/Product');
const Category = require('../models/Category');

router.post('/message', async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const result = await manager.process('en', message);
    const intent = result.intent;
    let responseText = "";

    // Threshold for confidence
    if (result.score < 0.5 && intent !== 'None') {
        // If confidence is low, treat as None
        // But let's be lenient for now
    }

    if (intent === 'greetings.hello') {
      responseText = "Hi...{user.name}how can I help you?";
    } else if (intent === 'agent.owner') {
      responseText = "Manu Mathew is the owner.";
    } else if (intent === 'agent.contact') {
      responseText = "You can contact us at +91 9207369246 or email cochincd@gmail.com. For customer support, call +91 8547251201.";
    } else if (intent === 'agent.about') {
      responseText = "We are Cochin Distributors. We are merchant partners located in Kattappana and we distribute food items across Idukki district.";
    } else if (intent === 'product.list') {
      const products = await Product.find().limit(10);
      if (products.length > 0) {
        const prodList = products.map(p => p.name).join(", ");
        responseText = `Here are some of our products: <b>${prodList}</b>${products.length >= 10 ? "..." : ""}`;
      } else {
        responseText = "We have various food items available.";
      }
    } else if (intent === 'product.categories') {
      const categories = await Category.find();
      if (categories.length > 0) {
        const catList = categories.map(c => c.name).join(", ");
        responseText = `We have the following categories: <b>${catList}</b>.`;
      } else {
        responseText = "We have various food categories available.";
      }
    } else if (intent === 'auth.password_change') {
      responseText = "To change your password, please follow these steps:<br>1. Log in to your account.<br>2. Go to your <b>Profile</b> or <b>Settings</b>.<br>3. Look for the <b>Change Password</b> section.<br>4. Enter your current password and then your new password.<br>5. Click <b>Save</b> or <b>Update</b>.<br><br>If you forgot your password, go to the <b>Login page</b> and click on <b>Forgot Password</b>.";
    } else if (intent === 'auth.password_change_admin') {
      responseText = "<b>Admin Password Change:</b><br>1. Log in as Admin.<br>2. On the sidebar, click on <b>Change Password</b>.<br>3. Enter your current password.<br>4. Enter and confirm your new password.<br>5. Click <b>Update Password</b>.";
    } else if (intent === 'auth.password_change_staff') {
      responseText = "<b>Staff Password Change:</b><br>1. If you can log in: Go to <b>Profile</b> and look for password settings (if available).<br>2. If you forgot your password: Go to the <b>Login page</b>, click <b>Forgot Password</b>, enter your staff email, and follow the link sent to your email to reset it.";
    } else if (intent === 'auth.password_change_user') {
      responseText = "<b>User Password Change:</b><br>1. Log in to your account.<br>2. Click on your <b>Name/Profile</b> in the top menu.<br>3. Select <b>My Profile</b>.<br>4. Scroll down to the <b>Change Password</b> section.<br>5. Enter current and new passwords, then click <b>Change Password</b>.";
    } else if (intent === 'delivery.time') {
      responseText = "The delivery time for products to a merchant is a <b>minimum of 2 days</b> and a <b>maximum of 3 days</b>.";
    } else {
        responseText = "I'm sorry, I didn't understand that. You can ask about us, contact, owner, products, or how to change password.";
    }

    res.json({ response: responseText, intent: intent, score: result.score });
  } catch (err) {
    console.error("Chatbot Error:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
