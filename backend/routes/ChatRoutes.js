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
    } else {
        responseText = "I'm sorry, I didn't understand that. You can ask about us, contact, owner, products, or categories.";
    }

    res.json({ response: responseText, intent: intent, score: result.score });
  } catch (err) {
    console.error("Chatbot Error:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
