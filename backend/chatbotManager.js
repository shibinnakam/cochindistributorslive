const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'], forceNER: true });

// Train the model
async function trainChatbot() {
  // Greetings
  manager.addDocument('en', 'hello', 'greetings.hello');
  manager.addDocument('en', 'hi', 'greetings.hello');
  manager.addDocument('en', 'hey', 'greetings.hello');
  manager.addDocument('en', 'good morning', 'greetings.hello');
  manager.addDocument('en', 'good afternoon', 'greetings.hello');
  manager.addDocument('en', 'good evening', 'greetings.hello');

  // Owner
  manager.addDocument('en', 'who is the owner', 'agent.owner');
  manager.addDocument('en', 'who runs this', 'agent.owner');
  manager.addDocument('en', 'founder', 'agent.owner');
  manager.addDocument('en', 'ceo', 'agent.owner');
  manager.addDocument('en', 'proprietor', 'agent.owner');
  manager.addDocument('en', 'who owns cochin distributors', 'agent.owner');
  manager.addDocument('en', 'boss', 'agent.owner');
  manager.addDocument('en', 'manager', 'agent.owner');

  // Contact
  manager.addDocument('en', 'contact number', 'agent.contact');
  manager.addDocument('en', 'how to contact', 'agent.contact');
  manager.addDocument('en', 'support email', 'agent.contact');
  manager.addDocument('en', 'phone number', 'agent.contact');
  manager.addDocument('en', 'customer care', 'agent.contact');
  manager.addDocument('en', 'help line', 'agent.contact');
  manager.addDocument('en', 'address', 'agent.contact');
  manager.addDocument('en', 'email', 'agent.contact');
  manager.addDocument('en', 'mobile', 'agent.contact');

  // About
  manager.addDocument('en', 'about us', 'agent.about');
  manager.addDocument('en', 'who are you', 'agent.about');
  manager.addDocument('en', 'what do you do', 'agent.about');
  manager.addDocument('en', 'company profile', 'agent.about');
  manager.addDocument('en', 'tell me about cochin distributors', 'agent.about');
  manager.addDocument('en', 'cochin distributors', 'agent.about');

  // Products
  manager.addDocument('en', 'show products', 'product.list');
  manager.addDocument('en', 'what items do you have', 'product.list');
  manager.addDocument('en', 'list items', 'product.list');
  manager.addDocument('en', 'what do you sell', 'product.list');
  manager.addDocument('en', 'catalogue', 'product.list');
  manager.addDocument('en', 'inventory', 'product.list');
  manager.addDocument('en', 'products', 'product.list');
  manager.addDocument('en', 'items', 'product.list');

  // Categories
  manager.addDocument('en', 'show categories', 'product.categories');
  manager.addDocument('en', 'what types of food', 'product.categories');
  manager.addDocument('en', 'varieties', 'product.categories');
  manager.addDocument('en', 'classification', 'product.categories');
  manager.addDocument('en', 'categories', 'product.categories');
  manager.addDocument('en', 'category', 'product.categories');

  // Password Change
  manager.addDocument('en', 'how to change password', 'auth.password_change');
  manager.addDocument('en', 'change my password', 'auth.password_change');
  manager.addDocument('en', 'reset password', 'auth.password_change');
  manager.addDocument('en', 'admin change password', 'auth.password_change_admin');
  manager.addDocument('en', 'staff change password', 'auth.password_change_staff');
  manager.addDocument('en', 'user change password', 'auth.password_change_user');
  manager.addDocument('en', 'forgot password', 'auth.password_change');

  // Delivery
  manager.addDocument('en', 'delivery time', 'delivery.time');
  manager.addDocument('en', 'how long to deliver', 'delivery.time');
  manager.addDocument('en', 'when will I get my product', 'delivery.time');
  manager.addDocument('en', 'delivery days', 'delivery.time');
  manager.addDocument('en', 'shipping time', 'delivery.time');

  await manager.train();
  manager.save();
  console.log('Chatbot trained');
}

// Train immediately on require (or export a function to do it)
trainChatbot();

module.exports = manager;
