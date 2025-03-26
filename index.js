require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));


const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "User" }
});

const User = mongoose.model('spa', UserSchema);


app.get('/users', async (req, res) => {
    const role = req.query.role;
    const username = req.query.username;
    let users;
    if(role=="Admin"){
        users=await User.find();
    }
    else{
        users= await User.findOne({username:"user"});
    }
    console.log(users);
  setTimeout(()=>{
    res.json(users);
  },2000);
});

app.post('/users', async (req, res) => {
    const { username, password, role } = req.body;
    const newUser = new User({ username, password, role });
  
    await newUser.save();
    res.json({ message: 'User added successfully' });
  });

  app.delete('/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID' });
      }
  
      const result = await User.deleteOne({ _id: id });
  
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });


  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    const user = await User.findOne({ username }); 
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  
    res.json({ success: true, user: { username: user.username, role: user.role } });
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
