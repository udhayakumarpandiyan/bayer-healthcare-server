const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = require('../helpers/db');

const Users = db.Users;

async function register(userParam) {
    const existingUser = await Users.findOne({ email: userParam.email });
    if (existingUser === null) {
        try {
            const user = new User(userParam);
            if (userParam.password) {
                user.hash = bcrypt.hashSync(userParam.password, 10);
            }
            await user.save();
        } catch(error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    } else {
        return res.status(409).json({ error: 'User already exists' });
    }
}

async function login({ email, password }) {
    try{
        const user = await Users.findOne({ email });
        if(!user) return res.status(404).json({ error: 'Invalid credentials' });

        if (user && bcrypt.compareSync(password, user.hash)) {
            let jwtSecretKey = process.env.JWT_SECRET_KEY;
            let data = {
                time: Date(),
                userId: email,
            }
            const token = jwt.sign(data, jwtSecretKey, { expiresIn: 7 * 24 * 60 * 60 }); // 7 days expiry
    
            // Set token in HTTP-Only cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Secure in production
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 // 7 days expiry
            });
    
            return {
                ...user.toJSON(),
            };
        }
    } catch(error){
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function logout(req, res) {
    try {
        res.clearCookie('token', {
            httpOnly: true,  // Ensures the cookie is not accessible via JavaScript
            secure: process.env.NODE_ENV === 'production',  // Set to true in production to only allow HTTPS requests
            sameSite: 'strict', // Prevents the cookie from being sent with cross-origin requests
            path: '/' // Ensures the correct path is used
        });
        return { message: 'Logout successful' };
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getAll() {
    return await Users.find();
}

async function getById(id) {
    return await Users.findById(id);
}

async function update(id, userParam) {
    const user = await Users.findById(id);
    // validate
    if (!user) throw 'User not found';
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }
    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }
    // copy userParam properties to user
    Object.assign(user, userParam);
    await user.save();
}

async function _delete(id) {
    await Users.findByIdAndRemove(id);
}

module.exports = {
    login,
    logout,
    getAll,
    getById,
    register,
    update,
    delete: _delete
};
